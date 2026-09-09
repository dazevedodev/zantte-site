"use server";

import { redirect } from "next/navigation";
import { getProductById } from "@/lib/store/products";
import { createOrder, setOrderPreference } from "@/lib/store/orders";
import { createOrderPreference } from "@/lib/store/mercadopago";
import { onlyDigits, isValidCpf } from "@/lib/store/format";
import { sendOrderCreatedEmail } from "@/lib/store/email";

export type CartCheckoutState = { error: string } | null;

function requireField(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`campo obrigatório: ${name}`);
  }
  return value.trim();
}

export async function createCartOrderAction(
  _prevState: CartCheckoutState,
  formData: FormData,
): Promise<CartCheckoutState> {
  let redirectUrl: string;

  try {
    const cartJson = formData.get("cartJson");
    if (typeof cartJson !== "string") return { error: "carrinho vazio" };

    const cartInput = JSON.parse(cartJson) as { productId: string; quantity: number }[];
    if (!Array.isArray(cartInput) || cartInput.length === 0) {
      return { error: "carrinho vazio" };
    }

    // nunca confiar no preço/nome que veio do carrinho do navegador — rebusca
    // cada produto no banco pra pegar os dados de verdade antes de cobrar.
    const items: { productId: string; productName: string; unitPriceCents: number; quantity: number }[] = [];
    for (const entry of cartInput) {
      const quantity = Math.max(1, Math.floor(Number(entry.quantity)) || 1);
      const product = await getProductById(entry.productId);
      if (!product || !product.active) {
        return { error: `um dos produtos do carrinho não está mais disponível` };
      }
      items.push({
        productId: product.id,
        productName: product.name,
        unitPriceCents: product.priceCents,
        quantity,
      });
    }

    const customerName = requireField(formData, "customerName");
    const customerEmail = requireField(formData, "customerEmail");
    const customerPhone = onlyDigits(requireField(formData, "customerPhone"));
    const customerCpf = onlyDigits(requireField(formData, "customerCpf"));

    if (!isValidCpf(customerCpf)) {
      return { error: "CPF inválido — confere se digitou certo, o Mercado Pago recusa CPF errado sem avisar" };
    }
    if (customerPhone.length < 10 || customerPhone.length > 11) {
      return { error: "telefone inválido" };
    }

    const shippingCep = onlyDigits(requireField(formData, "shippingCep"));
    if (shippingCep.length !== 8) return { error: "CEP inválido" };

    const shippingStreet = requireField(formData, "shippingStreet");
    const shippingNumber = requireField(formData, "shippingNumber");
    const shippingComplement = (formData.get("shippingComplement") as string | null)?.trim() || null;
    const shippingNeighborhood = requireField(formData, "shippingNeighborhood");
    const shippingCity = requireField(formData, "shippingCity");
    const shippingState = requireField(formData, "shippingState").toUpperCase().slice(0, 2);

    const order = await createOrder({
      items,
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      shippingCep,
      shippingStreet,
      shippingNumber,
      shippingComplement,
      shippingNeighborhood,
      shippingCity,
      shippingState,
    });

    const preference = await createOrderPreference(order);
    if (!preference.id || !preference.init_point) {
      return { error: "não foi possível iniciar o pagamento, tenta de novo" };
    }
    await setOrderPreference(order.id, preference.id, preference.init_point);

    try {
      await sendOrderCreatedEmail({
        ...order,
        mpPreferenceId: preference.id,
        mpInitPoint: preference.init_point,
      });
    } catch {
      // pedido e pagamento já foram criados; falha de e-mail não pode travar o checkout.
    }

    redirectUrl = preference.init_point;
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "algo deu errado, tenta de novo" };
  }

  redirect(redirectUrl);
}
