"use client";

import { useMemo, useState, type FormEvent } from "react";
import { formatBRL } from "@/lib/store/format";
import type { FinancialEntry } from "@/lib/finance";
import { calendarWindow } from "@/lib/finance-calendar";
import {
  createFinancialEntryAction,
  setFinancialEntryPaidAction,
  deleteFinancialEntryAction,
  setAccountBalanceAction,
} from "./actions";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoDate(year: number, month1: number, day: number) {
  return `${year}-${pad(month1)}-${pad(day)}`;
}

function todayIso() {
  const now = new Date();
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function buildGrid(year: number, month1: number) {
  const first = new Date(Date.UTC(year, month1 - 1, 1));
  const last = new Date(Date.UTC(year, month1, 0));
  const gridStart = new Date(first);
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());
  const gridEnd = new Date(last);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));

  const days: { iso: string; day: number; inMonth: boolean }[] = [];
  for (const d = new Date(gridStart); d <= gridEnd; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push({
      iso: d.toISOString().slice(0, 10),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() + 1 === month1 && d.getUTCFullYear() === year,
    });
  }
  return days;
}

function prevMonth(year: number, month1: number) {
  return month1 === 1 ? { year: year - 1, month: 12 } : { year, month: month1 - 1 };
}

function nextMonth(year: number, month1: number) {
  return month1 === 12 ? { year: year + 1, month: 1 } : { year, month: month1 + 1 };
}

export function CashFlowCalendar({
  year: initialYear,
  month: initialMonth,
  entries: initialEntries,
  balance: initialBalance,
}: {
  year: number;
  month: number;
  entries: FinancialEntry[];
  balance: number;
}) {
  // ano/mês e lançamentos são estado local — trocar de mês (ou adicionar/
  // marcar/remover) busca os dados novos por fetch direto e atualiza tudo
  // na hora, sem navegação de página nenhuma (nem Link, nem router.refresh,
  // que não tava confiável): a tela nunca "recarrega", só troca o conteúdo.
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [entries, setEntries] = useState(initialEntries);
  const [balance, setBalance] = useState(initialBalance);
  const [balanceEditing, setBalanceEditing] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [balancePending, setBalancePending] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [monthLoading, setMonthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEntries(y: number, m: number): Promise<{ entries: FinancialEntry[]; balance: number } | null> {
    const { start, end } = calendarWindow(y, m);
    try {
      const res = await fetch(`/admin/fluxo-caixa/entries-api?start=${start}&end=${end}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        setError(`falha ao recarregar (${res.status}): ${body.slice(0, 200)}`);
        return null;
      }
      return (await res.json()) as { entries: FinancialEntry[]; balance: number };
    } catch (err) {
      setError(`falha de rede ao recarregar: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  async function reload() {
    const fresh = await fetchEntries(year, month);
    if (fresh) {
      setEntries(fresh.entries);
      setBalance(fresh.balance);
    }
  }

  async function handleChangeMonth(y: number, m: number) {
    setMonthLoading(true);
    setSelectedDate(null);
    setError(null);
    const fresh = await fetchEntries(y, m);
    if (fresh) {
      setYear(y);
      setMonth(m);
      setEntries(fresh.entries);
      setBalance(fresh.balance);
      window.history.pushState(null, "", `?y=${y}&m=${m}`);
    }
    setMonthLoading(false);
  }

  async function handleSaveBalance(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBalancePending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("balance", balanceInput);
      const result = await setAccountBalanceAction(null, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      await reload();
      setBalanceEditing(false);
    } catch (err) {
      setError(`erro ao salvar saldo: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBalancePending(false);
    }
  }

  async function handleAdd(formData: FormData): Promise<boolean> {
    setPending(true);
    setError(null);
    try {
      const result = await createFinancialEntryAction(null, formData);
      if (result?.error) {
        setError(result.error);
        return false;
      }
      await reload();
      return true;
    } catch (err) {
      setError(`erro ao chamar a action: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    } finally {
      setPending(false);
    }
  }

  async function handleTogglePaid(id: string, paid: boolean) {
    try {
      await setFinancialEntryPaidAction(id, paid);
      await reload();
    } catch (err) {
      setError(`erro ao marcar: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFinancialEntryAction(id);
      await reload();
    } catch (err) {
      setError(`erro ao remover: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const days = useMemo(() => buildGrid(year, month), [year, month]);
  const byDate = useMemo(() => {
    const map = new Map<string, FinancialEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.dueDate) ?? [];
      list.push(entry);
      map.set(entry.dueDate, list);
    }
    return map;
  }, [entries]);

  const monthTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let pendingIncome = 0;
    let pendingExpense = 0;
    for (const entry of entries) {
      if (!entry.dueDate.startsWith(`${year}-${pad(month)}`)) continue;
      if (entry.kind === "entrada") {
        income += entry.amountCents;
        if (!entry.paid) pendingIncome += entry.amountCents;
      } else {
        expense += entry.amountCents;
        if (!entry.paid) pendingExpense += entry.amountCents;
      }
    }
    return { income, expense, balance: income - expense, pendingBalance: pendingIncome - pendingExpense };
  }, [entries, year, month]);

  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);
  const today = todayIso();
  const selectedEntries = selectedDate ? (byDate.get(selectedDate) ?? []) : [];
  // saldo atual + só o que AINDA NÃO foi marcado como feito neste mês —
  // usar o total do mês inteiro contaria duas vezes o que já foi marcado
  // (aquilo já entrou no saldo atual quando foi confirmado). Não é "saldo
  // daqui a X dias" de verdade (isso exigiria olhar todo lançamento
  // futuro, não só o mês visível), é só "com o que ainda falta desse mês,
  // devo terminar com quanto".
  const projectedBalance = balance + monthTotals.pendingBalance;

  return (
    <div className="cash-flow">
      <div className="cash-flow-summary">
        <div>
          <span className="cash-flow-summary-label">saldo atual da conta</span>
          {balanceEditing ? (
            <form
              className="cash-flow-balance-form"
              onSubmit={handleSaveBalance}
            >
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                defaultValue={(balance / 100).toFixed(2).replace(".", ",")}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="ex: 1500,00"
              />
              <button type="submit" className="cash-flow-balance-save" disabled={balancePending}>
                {balancePending ? "..." : "salvar"}
              </button>
              <button type="button" className="cash-flow-balance-cancel" onClick={() => setBalanceEditing(false)}>
                cancelar
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="cash-flow-summary-value cash-flow-balance-btn"
              onClick={() => {
                setBalanceInput((balance / 100).toFixed(2).replace(".", ","));
                setBalanceEditing(true);
                setError(null);
              }}
            >
              {formatBRL(balance)} <span className="cash-flow-balance-edit-hint">editar</span>
            </button>
          )}
        </div>
        <div>
          <span className="cash-flow-summary-label">entradas do mês</span>
          <span className="cash-flow-summary-value entrada">{formatBRL(monthTotals.income)}</span>
        </div>
        <div>
          <span className="cash-flow-summary-label">saídas do mês</span>
          <span className="cash-flow-summary-value saida">{formatBRL(monthTotals.expense)}</span>
        </div>
        <div>
          <span className="cash-flow-summary-label">fluxo previsto do mês</span>
          <span className={`cash-flow-summary-value ${monthTotals.balance >= 0 ? "entrada" : "saida"}`}>
            {formatBRL(monthTotals.balance)}
          </span>
        </div>
        <div>
          <span className="cash-flow-summary-label">saldo + pendente do mês</span>
          <span className={`cash-flow-summary-value ${projectedBalance >= 0 ? "entrada" : "saida"}`}>
            {formatBRL(projectedBalance)}
          </span>
        </div>
      </div>

      {error && <p className="cash-flow-error">{error}</p>}

      <div className="cash-flow-nav">
        <button
          type="button"
          onClick={() => handleChangeMonth(prev.year, prev.month)}
          className="cash-flow-nav-arrow"
          aria-label="mês anterior"
          disabled={monthLoading}
        >
          ‹
        </button>
        <span className="cash-flow-nav-label">
          {monthLoading ? "carregando..." : `${MONTH_NAMES[month - 1]} ${year}`}
        </span>
        <button
          type="button"
          onClick={() => handleChangeMonth(next.year, next.month)}
          className="cash-flow-nav-arrow"
          aria-label="próximo mês"
          disabled={monthLoading}
        >
          ›
        </button>
      </div>

      <div className="cash-flow-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cash-flow-weekday">
            {w}
          </div>
        ))}
        {days.map(({ iso, day, inMonth }) => {
          const dayEntries = byDate.get(iso) ?? [];
          const visible = dayEntries.slice(0, 2);
          const overflow = dayEntries.length - visible.length;
          return (
            <button
              key={iso}
              type="button"
              className={`cash-flow-day ${inMonth ? "" : "outside"} ${iso === today ? "today" : ""} ${
                selectedDate === iso ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedDate(iso);
                setError(null);
              }}
            >
              <span className="cash-flow-day-number">{day}</span>
              <span className="cash-flow-day-entries">
                {visible.map((e) => (
                  <span key={e.id} className={`cash-flow-chip ${e.kind} ${e.paid ? "paid" : ""}`}>
                    {formatBRL(e.amountCents)}
                  </span>
                ))}
                {overflow > 0 && <span className="cash-flow-chip-more">+{overflow}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="cash-flow-panel">
          <h2 className="cash-flow-panel-heading">
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </h2>

          {selectedEntries.length > 0 && (
            <ul className="cash-flow-entry-list">
              {selectedEntries.map((entry) => (
                <li key={entry.id} className={`cash-flow-entry ${entry.kind}`}>
                  <span className="cash-flow-entry-desc">{entry.description}</span>
                  <span className="cash-flow-entry-amount">{formatBRL(entry.amountCents)}</span>
                  <button
                    type="button"
                    className="cash-flow-entry-paid-btn"
                    onClick={() => handleTogglePaid(entry.id, !entry.paid)}
                  >
                    {entry.paid ? (entry.kind === "entrada" ? "recebido ✓" : "pago ✓") : "marcar como feito"}
                  </button>
                  <button
                    type="button"
                    className="cash-flow-entry-remove"
                    onClick={() => handleDelete(entry.id)}
                  >
                    remover
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            className="cash-flow-add-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              handleAdd(formData).then((success) => {
                if (success) form.reset();
              });
            }}
          >
            <input type="hidden" name="dueDate" value={selectedDate} />
            <select name="kind" defaultValue="saida">
              <option value="entrada">entrada</option>
              <option value="saida">saída</option>
            </select>
            <input name="description" type="text" placeholder="descrição" required />
            <input name="amount" type="text" inputMode="decimal" placeholder="valor (R$), ex: 50,00" required />
            <label className="cash-flow-add-paid">
              <input type="checkbox" name="paid" value="true" />
              já feito
            </label>
            <button type="submit" className="btn-solid" disabled={pending}>
              {pending ? "adicionando..." : "adicionar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
