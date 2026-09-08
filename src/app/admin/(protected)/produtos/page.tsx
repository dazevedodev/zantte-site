import Link from "next/link";
import { listAllProductsAdmin } from "@/lib/store/products";
import { formatBRL } from "@/lib/store/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAllProductsAdmin();

  return (
    <section className="admin-page">
      <div className="admin-page-head-row">
        <h1 className="display admin-page-heading">produtos</h1>
        <Link href="/admin/produtos/novo" className="btn-solid">
          novo produto
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>nome</th>
              <th>preço</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/produtos/${p.id}`}>{p.name}</Link>
                </td>
                <td>{formatBRL(p.priceCents)}</td>
                <td>{p.active ? "ativo" : "inativo"}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="admin-table-empty">
                  nenhum produto cadastrado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
