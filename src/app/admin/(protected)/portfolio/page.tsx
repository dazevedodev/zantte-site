import Link from "next/link";
import { listAllPortfolioProjectsAdmin } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const projects = await listAllPortfolioProjectsAdmin();

  return (
    <section className="admin-page">
      <div className="admin-page-head-row">
        <h1 className="display admin-page-heading">portfolio</h1>
        <Link href="/admin/portfolio/novo" className="btn-solid">
          novo projeto
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>nome</th>
              <th>link</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/portfolio/${p.id}`}>{p.name}</Link>
                </td>
                <td>{p.url ?? "—"}</td>
                <td>{p.active ? "ativo" : "inativo"}</td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={3} className="admin-table-empty">
                  nenhum projeto cadastrado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
