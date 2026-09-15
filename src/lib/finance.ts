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

function mapEntry(row: FinancialEntryRow): FinancialEntry {
  return {
    id: row.id,
    kind: row.kind,
    description: row.description,
    amountCents: row.amount_cents,
    // vem do banco como Date/ISO com hora — corta pro dia puro (YYYY-MM-DD)
    // pra bater exatamente com a célula do calendário, sem depender de fuso.
    dueDate: String(row.due_date).slice(0, 10),
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

export async function setFinancialEntryPaid(id: string, paid: boolean): Promise<void> {
  await sql`update financial_entries set paid = ${paid} where id = ${id}`;
}

export async function deleteFinancialEntry(id: string): Promise<void> {
  await sql`delete from financial_entries where id = ${id}`;
}
