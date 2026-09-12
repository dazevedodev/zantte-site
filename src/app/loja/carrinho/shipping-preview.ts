"use server";

import { getProductById } from "@/lib/store/products";
import { estimateCartShipping, type CartShippingResult } from "@/lib/store/shipping";
import { onlyDigits } from "@/lib/store/format";

export async function previewCartShippingAction(
  cep: string,
  cartInput: { productId: string; quantity: number }[],
): Promise<CartShippingResult | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8 || cartInput.length === 0) return null;

  const items: { product: NonNullable<Awaited<ReturnType<typeof getProductById>>>; quantity: number }[] = [];
  for (const entry of cartInput) {
    const product = await getProductById(entry.productId);
    if (product) items.push({ product, quantity: Math.max(1, Math.floor(entry.quantity) || 1) });
  }
  if (items.length === 0) return null;

  return estimateCartShipping(items, digits);
}
