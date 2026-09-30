"use server";

import { revalidatePath } from "next/cache";
import { getOrderById, setOrderPixPayment } from "@/lib/store/orders";
import { createPixPayment, PIX_EXPIRATION_MINUTES } from "@/lib/store/mercadopago";

export type PixState = { error: string } | null;

// assinatura (prevState, formData) exigida pelo useActionState no client,
// mesmo sem usar formData aqui — orderId já vem via .bind().
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function regeneratePixAction(
  orderId: string,
  _prevState: PixState,
  _formData: FormData,
): Promise<PixState> {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const order = await getOrderById(orderId);
  if (!order) return { error: "pedido não encontrado" };
  if (order.status !== "aguardando_pagamento") {
    return { error: "esse pedido não está mais aguardando pagamento" };
  }

  try {
    // idempotencyKey muda a cada tentativa — se usasse sempre a mesma, a MP
    // devolveria o mesmo pagamento (e o mesmo código já expirado) de novo.
    const pix = await createPixPayment(order, `pix-${order.id}-${Date.now()}`);
    const qrCode = pix.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = pix.point_of_interaction?.transaction_data?.qr_code_base64;
    if (!pix.id || !qrCode || !qrCodeBase64) {
      return { error: "o Mercado Pago não devolveu o código pix — tenta de novo em instantes" };
    }
    await setOrderPixPayment(order.id, {
      mpPaymentId: String(pix.id),
      pixQrCode: qrCode,
      pixQrCodeBase64: qrCodeBase64,
      pixExpiresAt: pix.date_of_expiration ?? new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60_000).toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `erro ao gerar o pix: ${message}` };
  }

  revalidatePath(`/pedido/${orderId}`);
  return null;
}
