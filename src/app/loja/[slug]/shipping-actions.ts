"use server";

import { getProductById } from "@/lib/store/products";
import { estimateProductShipping, type ProductShippingEstimate } from "@/lib/store/shipping";
import { onlyDigits } from "@/lib/store/format";

export type ShippingEstimateState =
  | { status: "ok"; estimate: ProductShippingEstimate }
  | { status: "error"; message: string }
  | null;

export async function estimateProductShippingAction(
  productId: string,
  _prevState: ShippingEstimateState,
  formData: FormData,
): Promise<ShippingEstimateState> {
  const cep = onlyDigits(String(formData.get("cep") ?? ""));
  if (cep.length !== 8) return { status: "error", message: "CEP inválido" };

  const product = await getProductById(productId);
  if (!product) return { status: "error", message: "produto não encontrado" };

  const estimate = await estimateProductShipping(product, cep);
  if (!estimate) {
    return {
      status: "error",
      message: "não conseguimos calcular o frete pra esse CEP agora, tenta de novo em instantes",
    };
  }

  return { status: "ok", estimate };
}
