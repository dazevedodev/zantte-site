import { NextResponse } from "next/server";
import { sql } from "@/lib/store/db";

// rota de migração de uso único — cria a tabela do saldo atual da conta.
// Mesmo padrão da migração do fluxo de caixa: roda uma vez logada, depois
// o arquivo é apagado.
export async function GET() {
  await sql`
    create table if not exists financial_balance (
      id text primary key,
      amount_cents integer not null default 0,
      updated_at timestamptz not null default now()
    )
  `;
  return NextResponse.json({ ok: true, message: "tabela financial_balance pronta" });
}
