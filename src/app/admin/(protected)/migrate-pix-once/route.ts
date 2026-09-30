import { NextResponse } from "next/server";
import { sql } from "@/lib/store/db";

// rota de migração de uso único — adiciona as colunas do Pix gerado
// direto (QR code + copia-e-cola + validade) na tabela orders. Mesmo
// padrão das outras migrações: roda uma vez logada, depois o arquivo é
// apagado.
export async function GET() {
  await sql`alter table orders add column if not exists pix_qr_code text`;
  await sql`alter table orders add column if not exists pix_qr_code_base64 text`;
  await sql`alter table orders add column if not exists pix_expires_at timestamptz`;
  return NextResponse.json({ ok: true, message: "colunas de pix prontas em orders" });
}
