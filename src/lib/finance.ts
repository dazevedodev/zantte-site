import { sql } from "./store/db";

export type FinancialEntry = {
  id: string;
  kind: "entrada" | "saida";
  description: string;
  amountCents: number;
  dueDate: string; // "YYYY-MM-DD"
  paid: boolean;
  createdAt: string;
};

type FinancialEntryRow = {
  id: string;
  kind: "entrada" | "saida";
  description: string;
  amount_cents: number;
  due_date: string;
  paid: boolean;
  created_at: string;
};

// a coluna "date" do Postgres volta do driver como objeto Date de verdade
// (não como texto) — String(dataObj) dá algo tipo "Tue Sep 15 2026...", que
// nunca batia com a chave "YYYY-MM-DD" que o calendário usa. Era por isso
// que o lançamento salvava certinho no banco mas nunca aparecia em lugar
// nenhum: a data comparada nunca era igual à data procurada.
function toDateOnly(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function mapEntry(row: FinancialEntryRow): FinancialEntry {
  return {
    id: row.id,
    kind: row.kind,
    description: row.description,
    amountCents: row.amount_cents,
    dueDate: toDateOnly(row.due_date),
    paid: row.paid,
    createdAt: row.created_at,
  };
}

// lista uma janela de meses (start/end inclusive, "YYYY-MM-DD") — o
// calendário só pede o mês visível (+ vizinhos, pra pré-carregar a troca de
// mês), não faz sentido trazer o histórico inteiro toda vez.
export async function listFinancialEntries(startDate: string, endDate: string): Promise<FinancialEntry[]> {
  const rows = (await sql`
    select * from financial_entries
    where due_date between ${startDate} and ${endDate}
    order by due_date asc, created_at asc
  `) as FinancialEntryRow[];
  return rows.map(mapEntry);
}

export async function createFinancialEntry(input: {
  kind: "entrada" | "saida";
  description: string;
  amountCents: number;
  dueDate: string;
  paid: boolean;
}): Promise<FinancialEntry> {
  const rows = (await sql`
    insert into financial_entries (kind, description, amount_cents, due_date, paid)
    values (${input.kind}, ${input.description}, ${input.amountCents}, ${input.dueDate}, ${input.paid})
    returning *
  `) as FinancialEntryRow[];
  return mapEntry(rows[0]);
}

// soma (ou subtrai) do saldo atual, de forma atômica — nunca sobrescreve
// o valor, só ajusta em cima do que já tá lá (pra não pisar numa edição
// manual que tenha acontecido entre a leitura e a escrita).
async function adjustAccountBalance(deltaCents: number): Promise<void> {
  if (deltaCents === 0) return;
  await sql`
    insert into financial_balance (id, amount_cents, updated_at)
    values ('main', ${deltaCents}, now())
    on conflict (id) do update
      set amount_cents = financial_balance.amount_cents + excluded.amount_cents,
          updated_at = now()
  `;
}

// marcar uma entrada como recebida soma o valor no saldo da conta; marcar
// uma saída como paga subtrai. Desmarcar reverte o mesmo efeito. O saldo
// só é o número real da conta se ele acompanhar o que de fato já
// aconteceu — se não fizesse isso, ela teria que ficar recalculando e
// reeditando o saldo manualmente cada vez que algo é pago/recebido.
export async function setFinancialEntryPaid(id: string, paid: boolean): Promise<void> {
  const rows = (await sql`
    select kind, amount_cents, paid from financial_entries where id = ${id}
  `) as { kind: "entrada" | "saida"; amount_cents: number; paid: boolean }[];
  const entry = rows[0];
  if (!entry) return;

  await sql`update financial_entries set paid = ${paid} where id = ${id}`;

  if (entry.paid === paid) return; // já tava nesse estado, sem efeito duplicado no saldo

  const direction = entry.kind === "entrada" ? 1 : -1;
  const delta = (paid ? 1 : -1) * direction * entry.amount_cents;
  await adjustAccountBalance(delta);
}

export async function deleteFinancialEntry(id: string): Promise<void> {
  const rows = (await sql`
    select kind, amount_cents, paid from financial_entries where id = ${id}
  `) as { kind: "entrada" | "saida"; amount_cents: number; paid: boolean }[];
  const entry = rows[0];

  await sql`delete from financial_entries where id = ${id}`;

  // só desfaz o efeito no saldo se esse lançamento já tinha sido contado
  // (marcado como feito) — remover algo que nunca foi confirmado não
  // deveria mexer no saldo.
  if (!entry || !entry.paid) return;

  const direction = entry.kind === "entrada" ? 1 : -1;
  const delta = -1 * direction * entry.amount_cents;
  await adjustAccountBalance(delta);
}

// saldo da conta agora — uma linha só (id fixo "main"), ela mesma atualiza
// quando o valor muda de verdade (não é derivado dos lançamentos, é o que
// ela vê no banco/app do banco).
//
// Se a tabela ainda não existir (antes de rodar a migração), volta 0 em
// vez de derrubar a página inteira do fluxo de caixa — a página do
// fluxo de caixa é muito mais importante que esse saldo pra travar por
// causa disso.
export async function getAccountBalance(): Promise<number> {
  try {
    const rows = (await sql`select amount_cents from financial_balance where id = 'main'`) as {
      amount_cents: number;
    }[];
    return rows[0]?.amount_cents ?? 0;
  } catch {
    return 0;
  }
}

export async function setAccountBalance(cents: number): Promise<void> {
  await sql`
    insert into financial_balance (id, amount_cents, updated_at)
    values ('main', ${cents}, now())
    on conflict (id) do update set amount_cents = excluded.amount_cents, updated_at = excluded.updated_at
  `;
}
