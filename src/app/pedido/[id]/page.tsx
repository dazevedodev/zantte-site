import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getOrderById } from "@/lib/store/orders";
import { ORDER_STATUS_LABELS } from "@/lib/store/types";
import { formatBRL } from "@/lib/store/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Seu pedido — Zantte", robots: { index: false, follow: false } };

const STEPS = ["aguardando_pagamento", "pago", "enviado", "entregue"] as const;

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <>
      <header className="portfolio-page-header">
        <Link href="/">← voltar</Link>
      </header>

      <section className="pedido-tracking">
        <span className="mono label">pedido</span>
        <h1 className="display pedido-heading">{order.productName}</h1>
        <p className="mono pedido-amount">{formatBRL(order.amountCents)}</p>

        {order.status === "cancelado" ? (
          <p className="pedido-status-cancelado">este pedido foi cancelado.</p>
        ) : (
          <ol className="pedido-steps">
            {STEPS.map((step, i) => (
              <li key={step} className={i <= stepIndex ? "done" : ""}>
                {ORDER_STATUS_LABELS[step]}
              </li>
            ))}
          </ol>
        )}

        {order.trackingCode && (
          <p className="pedido-tracking-code mono">
            {order.trackingCarrier}: {order.trackingCode}
          </p>
        )}

        <div className="pedido-details">
          <p>
            <span className="mono label">entrega</span>
            <br />
            {order.shippingStreet}, {order.shippingNumber}
            {order.shippingComplement ? ` — ${order.shippingComplement}` : ""}
            <br />
            {order.shippingNeighborhood}, {order.shippingCity}/{order.shippingState}
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
