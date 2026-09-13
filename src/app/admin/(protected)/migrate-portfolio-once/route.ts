import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/store/session";
import { sql } from "@/lib/store/db";

// rota de uso único — cria a tabela portfolio_projects e migra os 4
// projetos que estavam hardcoded em src/lib/projects.ts (apagado). Rodar
// uma vez logada como admin, depois apagar este arquivo.
export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  await sql`create extension if not exists pgcrypto`;

  await sql`
    create table if not exists portfolio_projects (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      tagline text,
      url text,
      cover_url text,
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  const existing = (await sql`select count(*)::int as count from portfolio_projects`) as { count: number }[];
  if ((existing[0]?.count ?? 0) === 0) {
    const seed = [
      { name: "awell.com.br", url: "https://awell.com.br" },
      { name: "awellvivo.com.br", url: "https://awellvivo.com.br" },
      { name: "runtrack.com.br", url: "https://runtrack.com.br" },
      { name: "naviu.com.br", url: "https://naviu.com.br" },
    ];
    for (const p of seed) {
      await sql`insert into portfolio_projects (name, url) values (${p.name}, ${p.url})`;
    }
  }

  const rows = await sql`select id, name, url, active from portfolio_projects order by created_at asc`;
  return NextResponse.json({ ok: true, rows });
}
