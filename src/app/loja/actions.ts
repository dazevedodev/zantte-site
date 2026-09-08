"use server";

import { redirect } from "next/navigation";
import { getProductById } from "@/lib/store/products";
import { createOrder, setOrderPreference } from "@/lib/store/orders";
import { createOrderPreference } from "@/lib/store/mercadopago";
import { onlyDigits } from "@/lib/store/format";

export type BuyFormState = { error: string } | null;

function requireField(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`campo obrigatório: ${name}`);
  }
  return value.trim();
}

export async function createOrderAction(
  _prevState: BuyFormState,
  formData: FormData,
): Promise<BuyFormState> {
  let redirectUrl: string;

  try {
    const productId = requireField(formData, "productId");
    const quantity = Math.max(1, Number(formData.get("quantity")) || 1);

    const product = await getProductById(productId);
    if (!product || !product.active) {
      return { error: "produto indisponível" };
    }

    const customerName = requireField(formData, "customerName");
    const customerEmail = requireField(formData, "customerEmail");
    const customerPhone = onlyDigits(requireField(formData, "customerPhone"));
    const customerCpf = onlyDigits(requireField(formData, "customerCpf"));

    if (customerCpf.length !== 11) return { error: "CPF inválido" };
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
      productId: product.id,
      productName: product.name,
      productPriceCents: product.priceCents,
      quantity,
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
    await setOrderPreference(order.id, preference.id);

    redirectUrl = preference.init_point;
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "algo deu errado, tenta de novo" };
  }

  redirect(redirectUrl);
}
