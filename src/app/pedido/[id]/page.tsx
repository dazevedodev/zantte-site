import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getOrderById } from "@/lib/store/orders";
import { ORDER_STATUS_LABELS } from "@/lib/store/types";
import { formatBRL } from "@/lib/store/format";
import { PurchasePixel } from "./purchase-pixel";
import { PixPanel } from "./pix-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Seu pedido — Zantte", robots: { index: false, follow: false } };

const STEPS = ["aguardando_pagamento", "pago", "enviado", "entregue"] as const;

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  const isPaid = order.status !== "aguardando_pagamento" && order.status !== "cancelado";

  return (
    <div className="store-theme">
      {isPaid && <PurchasePixel orderId={order.id} amountCents={order.amountCents} />}

      <header className="portfolio-page-header">
        <Link href="/">← voltar</Link>
      </header>

      <section className="pedido-tracking">
        <span className="label">pedido</span>
        <h1 className="display pedido-heading">
          {order.items[0]?.productName}
          {order.items.length > 1 ? ` + ${order.items.length - 1} item${order.items.length > 2 ? "s" : ""}` : ""}
        </h1>
        <ul className="pedido-items">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity}x {item.productName} — {formatBRL(item.lineTotalCents)}
            </li>
          ))}
        </ul>
        {order.shippingCostCents > 0 && (
          <p className="pedido-shipping-cost">
            frete: {formatBRL(order.shippingCostCents)}
            {order.shippingDaysEstimate ? ` — chega em ${order.shippingDaysEstimate}` : ""}
          </p>
        )}
        <p className="pedido-amount">total: {formatBRL(order.amountCents)}</p>

        {order.status === "aguardando_pagamento" && (
          <PixPanel
            orderId={order.id}
            pixQrCode={order.pixQrCode}
            pixQrCodeBase64={order.pixQrCodeBase64}
            pixExpiresAt={order.pixExpiresAt}
            mpInitPoint={order.mpInitPoint}
          />
        )}

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
          <p className="pedido-tracking-code">
            {order.trackingCarrier}: {order.trackingCode}
          </p>
        )}

        <div className="pedido-details">
          <p>
            <span className="label">entrega</span>
            <br />
            {order.shippingStreet}, {order.shippingNumber}
            {order.shippingComplement ? ` — ${order.shippingComplement}` : ""}
            <br />
            {order.shippingNeighborhood}, {order.shippingCity}/{order.shippingState}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
