import { sql } from "./store/db";

export type PortfolioProject = {
  id: string;
  name: string;
  tagline: string | null;
  url: string | null;
  coverUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type PortfolioProjectRow = {
  id: string;
  name: string;
  tagline: string | null;
  url: string | null;
  cover_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function mapProject(row: PortfolioProjectRow): PortfolioProject {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    url: row.url,
    coverUrl: row.cover_url,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listActivePortfolioProjects(): Promise<PortfolioProject[]> {
  const rows = (await sql`
    select * from portfolio_projects where active = true order by created_at asc
  `) as PortfolioProjectRow[];
  return rows.map(mapProject);
}

export async function listAllPortfolioProjectsAdmin(): Promise<PortfolioProject[]> {
  const rows = (await sql`
    select * from portfolio_projects order by created_at asc
  `) as PortfolioProjectRow[];
  return rows.map(mapProject);
}

export async function getPortfolioProjectById(id: string): Promise<PortfolioProject | null> {
  const rows = (await sql`
    select * from portfolio_projects where id = ${id} limit 1
  `) as PortfolioProjectRow[];
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function createPortfolioProject(input: {
  name: string;
  tagline: string | null;
  url: string | null;
  coverUrl: string | null;
}): Promise<PortfolioProject> {
  const rows = (await sql`
    insert into portfolio_projects (name, tagline, url, cover_url)
    values (${input.name}, ${input.tagline}, ${input.url}, ${input.coverUrl})
    returning *
  `) as PortfolioProjectRow[];
  return mapProject(rows[0]);
}

export async function updatePortfolioProject(
  id: string,
  input: { name: string; tagline: string | null; url: string | null; coverUrl: string | null },
): Promise<PortfolioProject> {
  const rows = (await sql`
    update portfolio_projects
    set name = ${input.name},
        tagline = ${input.tagline},
        url = ${input.url},
        cover_url = ${input.coverUrl},
        updated_at = now()
    where id = ${id}
    returning *
  `) as PortfolioProjectRow[];
  return mapProject(rows[0]);
}

export async function setPortfolioProjectActive(id: string, active: boolean): Promise<void> {
  await sql`update portfolio_projects set active = ${active}, updated_at = now() where id = ${id}`;
}

export async function deletePortfolioProject(id: string): Promise<void> {
  await sql`delete from portfolio_projects where id = ${id}`;
}
