import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/store/orders";
import { ORDER_STATUS_LABELS } from "@/lib/store/types";
import { formatBRL } from "@/lib/store/format";
import { markDeliveredAction, cancelOrderAction } from "./actions";
import { ShipForm } from "./ship-form";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <section className="admin-page">
      <span className="mono label">pedido</span>
      <h1 className="display admin-page-heading">{order.productName}</h1>
      <span className={`order-status-badge status-${order.status}`}>
        {ORDER_STATUS_LABELS[order.status]}
      </span>

      <div className="admin-order-grid">
        <div className="admin-order-block">
          <h2 className="mono label">cliente</h2>
          <p>{order.customerName}</p>
          <p>{order.customerEmail}</p>
          <p>{order.customerPhone}</p>
          <p>CPF: {order.customerCpf}</p>
        </div>

        <div className="admin-order-block">
          <h2 className="mono label">entrega</h2>
          <p>
            {order.shippingStreet}, {order.shippingNumber}
            {order.shippingComplement ? ` — ${order.shippingComplement}` : ""}
          </p>
          <p>
            {order.shippingNeighborhood}, {order.shippingCity}/{order.shippingState}
          </p>
          <p>CEP: {order.shippingCep}</p>
        </div>

        <div className="admin-order-block">
          <h2 className="mono label">pagamento</h2>
          <p>{formatBRL(order.amountCents)}</p>
          <p>quantidade: {order.quantity}</p>
          {order.mpPaymentId && <p className="mono">MP: {order.mpPaymentId}</p>}
        </div>
      </div>

      {order.status === "pago" && (
        <div className="admin-order-block">
          <h2 className="mono label">marcar como enviado</h2>
          <ShipForm orderId={order.id} />
        </div>
      )}

      {order.status === "enviado" && (
        <div className="admin-order-block">
          <p>
            rastreio: {order.trackingCarrier} — {order.trackingCode}
          </p>
          <form action={markDeliveredAction.bind(null, order.id)}>
            <button type="submit" className="btn-solid">
              marcar como entregue
            </button>
          </form>
        </div>
      )}

      {(order.status === "aguardando_pagamento" || order.status === "pago") && (
        <form action={cancelOrderAction.bind(null, order.id)} className="admin-cancel-form">
          <button type="submit">cancelar pedido</button>
        </form>
      )}
    </section>
  );
}
