"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatBRL } from "@/lib/store/format";
import type { FinancialEntry } from "@/lib/finance";
import {
  createFinancialEntryAction,
  setFinancialEntryPaidAction,
  deleteFinancialEntryAction,
  type FinanceFormState,
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

// mesma janela calculada no server (page.tsx) — dias do mês vizinho que
// completam a semana da primeira/última linha da grade.
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
  year,
  month,
  entries,
}: {
  year: number;
  month: number;
  entries: FinancialEntry[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formState, formAction, pending] = useActionState<FinanceFormState, FormData>(
    createFinancialEntryAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  // rede de segurança: o Next já deveria atualizar sozinho os dados do
  // servidor depois de uma Server Action, mas força um refresh explícito
  // (e limpa o formulário) assim que o "adicionar" termina sem erro —
  // pra nunca parecer que "não aconteceu nada" quando na real só a tela
  // que não tinha se atualizado.
  useEffect(() => {
    if (wasPending.current && !pending) {
      if (!formState?.error) {
        formRef.current?.reset();
        router.refresh();
      }
    }
    wasPending.current = pending;
  }, [pending, formState, router]);

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
    for (const entry of entries) {
      if (!entry.dueDate.startsWith(`${year}-${pad(month)}`)) continue;
      if (entry.kind === "entrada") income += entry.amountCents;
      else expense += entry.amountCents;
    }
    return { income, expense, balance: income - expense };
  }, [entries, year, month]);

  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);
  const today = todayIso();
  const selectedEntries = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  return (
    <div className="cash-flow">
      <div className="cash-flow-summary">
        <div>
          <span className="cash-flow-summary-label">entradas do mês</span>
          <span className="cash-flow-summary-value entrada">{formatBRL(monthTotals.income)}</span>
        </div>
        <div>
          <span className="cash-flow-summary-label">saídas do mês</span>
          <span className="cash-flow-summary-value saida">{formatBRL(monthTotals.expense)}</span>
        </div>
        <div>
          <span className="cash-flow-summary-label">saldo previsto</span>
          <span className={`cash-flow-summary-value ${monthTotals.balance >= 0 ? "entrada" : "saida"}`}>
            {formatBRL(monthTotals.balance)}
          </span>
        </div>
      </div>

      <div className="cash-flow-nav">
        <Link href={`?y=${prev.year}&m=${prev.month}`} className="cash-flow-nav-arrow" aria-label="mês anterior">
          ‹
        </Link>
        <span className="cash-flow-nav-label">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Link href={`?y=${next.year}&m=${next.month}`} className="cash-flow-nav-arrow" aria-label="próximo mês">
          ›
        </Link>
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
              onClick={() => setSelectedDate(iso)}
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

          {formState?.error && <p className="cash-flow-error">{formState.error}</p>}

          {selectedEntries.length > 0 && (
            <ul className="cash-flow-entry-list">
              {selectedEntries.map((entry) => (
                <li key={entry.id} className={`cash-flow-entry ${entry.kind}`}>
                  <span className="cash-flow-entry-desc">{entry.description}</span>
                  <span className="cash-flow-entry-amount">{formatBRL(entry.amountCents)}</span>
                  <form action={setFinancialEntryPaidAction.bind(null, entry.id, !entry.paid)}>
                    <button type="submit" className="cash-flow-entry-paid-btn">
                      {entry.paid ? (entry.kind === "entrada" ? "recebido ✓" : "pago ✓") : "marcar como feito"}
                    </button>
                  </form>
                  <form action={deleteFinancialEntryAction.bind(null, entry.id)}>
                    <button type="submit" className="cash-flow-entry-remove">
                      remover
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form ref={formRef} action={formAction} className="cash-flow-add-form">
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
