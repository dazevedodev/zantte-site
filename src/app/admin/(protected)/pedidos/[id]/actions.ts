"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/store/session";
import { getOrderById, setOrderShipped, setOrderDelivered, cancelOrder } from "@/lib/store/orders";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/store/email";

export type OrderActionState = { error: string } | null;

export async function markShippedAction(
  orderId: string,
  _prevState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const carrier = formData.get("trackingCarrier");
  const code = formData.get("trackingCode");
  if (typeof carrier !== "string" || !carrier.trim() || typeof code !== "string" || !code.trim()) {
    return { error: "informe transportadora e código de rastreio" };
  }

  await setOrderShipped(orderId, carrier.trim(), code.trim());

  const order = await getOrderById(orderId);
  if (order) {
    try {
      await sendOrderShippedEmail(order);
    } catch {
      // pedido já foi marcado como enviado; falha de e-mail não deve travar o fluxo.
    }
  }

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
  return null;
}

export async function markDeliveredAction(orderId: string): Promise<void> {
  if (!(await verifyAdminSession())) return;

  await setOrderDelivered(orderId);
  const order = await getOrderById(orderId);
  if (order) {
    try {
      await sendOrderDeliveredEmail(order);
    } catch {
      // idem — status já foi atualizado, e-mail é best-effort.
    }
  }

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
}

export async function cancelOrderAction(orderId: string): Promise<void> {
  if (!(await verifyAdminSession())) return;
  await cancelOrder(orderId);
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
}
