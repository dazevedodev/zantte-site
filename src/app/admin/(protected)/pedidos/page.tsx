import Link from "next/link";
import { listOrdersAdmin } from "@/lib/store/orders";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/store/types";
import { formatBRL } from "@/lib/store/format";

export const dynamic = "force-dynamic";

const FILTERS: (OrderStatus | "todos")[] = [
  "todos",
  "aguardando_pagamento",
  "pago",
  "enviado",
  "entregue",
  "cancelado",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = FILTERS.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await listOrdersAdmin(filter);

  return (
    <section className="admin-page">
      <h1 className="display admin-page-heading">pedidos</h1>

      <div className="admin-filter-row mono">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "todos" ? "/admin/pedidos" : `/admin/pedidos?status=${f}`}
            className={filter === f || (f === "todos" && !filter) ? "active" : ""}
          >
            {f === "todos" ? "todos" : ORDER_STATUS_LABELS[f]}
          </Link>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>data</th>
              <th>cliente</th>
              <th>produto</th>
              <th>valor</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/pedidos/${o.id}`}>
                    {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                  </Link>
                </td>
                <td>{o.customerName}</td>
                <td>{o.productName}</td>
                <td>{formatBRL(o.amountCents)}</td>
                <td>
                  <span className={`order-status-badge status-${o.status}`}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  nenhum pedido ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
