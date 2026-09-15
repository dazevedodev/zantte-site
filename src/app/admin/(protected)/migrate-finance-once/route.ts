import { NextResponse } from "next/server";
import { sql } from "@/lib/store/db";

// rota de migração de uso único — cria a tabela do fluxo de caixa pessoal.
// Protegida pelo mesmo proxy que cobre todo /admin/**. Depois de rodar uma
// vez (visitando essa URL logada), o arquivo é apagado.
export async function GET() {
  await sql`
    create table if not exists financial_entries (
      id uuid primary key default gen_random_uuid(),
      kind text not null check (kind in ('entrada', 'saida')),
      description text not null,
      amount_cents integer not null check (amount_cents > 0),
      due_date date not null,
      paid boolean not null default false,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists financial_entries_due_date_idx on financial_entries (due_date)`;

  return NextResponse.json({ ok: true, message: "tabela financial_entries pronta" });
}
