import crypto from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { Order } from "./types";
import { onlyDigits } from "./format";

function client() {
  return new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
}

export async function createOrderPreference(order: Order) {
  const preference = new Preference(client());
  const phone = onlyDigits(order.customerPhone);

  // Pix exige identificação completa do pagador (nome + sobrenome, não só um
  // campo de nome único) — sem isso o botão "Criar Pix" no checkout da MP
  // fica travado/cinza, sem mensagem de erro nenhuma pro cliente.
  const [firstName, ...rest] = order.customerName.trim().split(/\s+/);
  const surname = rest.join(" ") || firstName;

  const result = await preference.create({
    body: {
      external_reference: order.id,
      items: [
        ...order.items.map((item) => ({
          id: item.productId,
          title: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPriceCents / 100,
          currency_id: "BRL",
        })),
        // frete entra como item separado pra bater com amount_cents do
        // pedido (soma de produtos + frete) — sem isso a MP cobrava só o
        // valor dos produtos e o pedido ficava registrado com valor maior
        // do que o que o cliente realmente pagou.
        ...(order.shippingCostCents > 0
          ? [
              {
                id: "frete",
                title: "frete",
                quantity: 1,
                unit_price: order.shippingCostCents / 100,
                currency_id: "BRL",
              },
            ]
          : []),
      ],
      payer: {
        name: firstName,
        surname,
        email: order.customerEmail,
        identification: { type: "CPF", number: onlyDigits(order.customerCpf) },
        phone: { area_code: phone.slice(0, 2), number: phone.slice(2) },
        address: {
          zip_code: onlyDigits(order.shippingCep),
          street_name: order.shippingStreet,
          street_number: order.shippingNumber.replace(/\D/g, "") || undefined,
        },
      },
      back_urls: {
        success: `${siteUrl()}/pedido/${order.id}`,
        pending: `${siteUrl()}/pedido/${order.id}`,
        failure: `${siteUrl()}/pedido/${order.id}`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl()}/api/mercadopago/webhook`,
      // essa preferência agora só serve de link "pagar com cartão" — o Pix
      // já sai gerado direto (createPixPayment) e mostrado na própria
      // página do pedido. Sem excluir "bank_transfer" (categoria do Pix na
      // MP) daqui, o checkout hospedado oferecia um SEGUNDO botão de Pix,
      // com o mesmo bug antigo de ficar travado/sem código.
      payment_methods: {
        excluded_payment_types: [{ id: "bank_transfer" }],
      },
    },
    requestOptions: { idempotencyKey: order.id },
  });

  return result;
}

export async function fetchPayment(paymentId: string) {
  const payment = new Payment(client());
  return payment.get({ id: paymentId });
}

// tempo de validade do código Pix — depois disso o "copia e cola" para de
// funcionar do lado da MP e a página do pedido oferece gerar um novo.
export const PIX_EXPIRATION_MINUTES = 60;

/**
 * Gera o Pix direto pela API de pagamentos (em vez de depender do checkout
 * hospedado da MP) — o QR code e o "copia e cola" ficam disponíveis pra
 * gente mostrar na própria página do pedido, que não desaparece se o
 * cliente sair da tela. idempotencyKey deve variar a cada tentativa nova
 * (senão a MP devolve o mesmo pagamento/código já expirado).
 */
export async function createPixPayment(order: Order, idempotencyKey: string) {
  const payment = new Payment(client());
  const [firstName, ...rest] = order.customerName.trim().split(/\s+/);
  const surname = rest.join(" ") || firstName;

  return payment.create({
    body: {
      transaction_amount: order.amountCents / 100,
      description: order.items.map((item) => item.productName).join(", ").slice(0, 250),
      payment_method_id: "pix",
      external_reference: order.id,
      notification_url: `${siteUrl()}/api/mercadopago/webhook`,
      date_of_expiration: new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60_000).toISOString(),
      payer: {
        email: order.customerEmail,
        first_name: firstName,
        last_name: surname,
        identification: { type: "CPF", number: onlyDigits(order.customerCpf) },
      },
    },
    requestOptions: { idempotencyKey },
  });
}

/**
 * A MP assina o webhook em x-signature: "ts=<unix>,v1=<hmac hex>".
 * Nunca confiar no corpo do POST sem validar essa assinatura primeiro.
 * https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks#editor_2
 */
export function verifyWebhookSignature(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret || !params.xSignature || !params.xRequestId || !params.dataId) return false;

  const parts = Object.fromEntries(
    params.xSignature.split(",").map((piece) => {
      const [key, value] = piece.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${params.dataId.toLowerCase()};request-id:${params.xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
