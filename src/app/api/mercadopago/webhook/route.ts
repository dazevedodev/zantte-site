import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature, fetchPayment } from "@/lib/store/mercadopago";
import { getOrderById, markOrderPaid } from "@/lib/store/orders";

// A MP retenta o webhook até receber 2xx. Por isso: sempre responder 200
// depois de validar, mesmo quando ignoramos o evento (tipo desconhecido,
// pedido não encontrado) — um status != 2xx só gera retentativas inúteis,
// a segurança de verdade é a assinatura + a rebusca do pagamento na API.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { type?: string; data?: { id?: string } } | null;
  const dataId = body?.data?.id ?? request.nextUrl.searchParams.get("data.id");

  const validSignature = verifyWebhookSignature({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId: dataId ?? null,
  });

  if (!validSignature) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (body?.type !== "payment" || !dataId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const payment = await fetchPayment(dataId);
    const orderId = payment.external_reference;
    const amountCents = Math.round((payment.transaction_amount ?? 0) * 100);

    if (!orderId || payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // confere se o valor pago bate com o pedido antes de marcar como pago —
    // nunca confiar cegamente no que veio no webhook/no fetch.
    const order = await getOrderById(orderId);
    if (!order || order.amountCents !== amountCents) {
      return NextResponse.json({ ok: true });
    }

    await markOrderPaid(orderId, String(payment.id), payment.status_detail ?? "");
  } catch {
    // erro ao consultar a MP — respondemos 200 mesmo assim pra evitar
    // retentativa em loop; se o pagamento ficou de fato pendente de
    // confirmação, o próximo webhook (ou uma reconciliação manual) resolve.
  }

  return NextResponse.json({ ok: true });
}
