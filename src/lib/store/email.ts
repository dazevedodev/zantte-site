import { Resend } from "resend";
import type { Order } from "./types";
import { formatBRL } from "./format";

function client() {
  return new Resend(process.env.RESEND_API_KEY!);
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
}

function trackingUrl(order: Order) {
  return `${siteUrl()}/pedido/${order.id}`;
}

function itemsSummary(order: Order) {
  return order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ");
}

export async function sendOrderCreatedEmail(order: Order) {
  await client().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: order.customerEmail,
    subject: `Seu pedido na Zantte — finalize o pagamento`,
    text: [
      `Olá, ${order.customerName}!`,
      ``,
      `Recebemos seu pedido (${itemsSummary(order)} — ${formatBRL(order.amountCents)}), mas ele só é confirmado depois do pagamento.`,
      order.mpInitPoint ? `Pague agora: ${order.mpInitPoint}` : null,
      ``,
      `Guarda esse e-mail — se você fechar a tela de pagamento (inclusive a do Pix) antes de terminar,`,
      `é só voltar aqui e clicar no link acima de novo, ou acompanhar o pedido em: ${trackingUrl(order)}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function sendOrderShippedEmail(order: Order) {
  await client().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: order.customerEmail,
    subject: `Seu pedido na Zantte foi enviado`,
    text: [
      `Olá, ${order.customerName}!`,
      ``,
      `Seu pedido (${itemsSummary(order)} — ${formatBRL(order.amountCents)}) já foi enviado.`,
      order.trackingCarrier ? `Transportadora: ${order.trackingCarrier}` : null,
      order.trackingCode ? `Código de rastreio: ${order.trackingCode}` : null,
      ``,
      `Acompanhe o status a qualquer momento em: ${trackingUrl(order)}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function sendOrderDeliveredEmail(order: Order) {
  await client().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: order.customerEmail,
    subject: `Seu pedido na Zantte foi entregue`,
    text: [
      `Olá, ${order.customerName}!`,
      ``,
      `Seu pedido (${itemsSummary(order)}) foi marcado como entregue.`,
      `Qualquer problema, é só responder este e-mail.`,
      ``,
      `Detalhes: ${trackingUrl(order)}`,
    ].join("\n"),
  });
}
