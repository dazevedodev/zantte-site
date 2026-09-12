import { calculateShipping } from "./melhorenvio";
import type { Product } from "./types";

export type ProductShippingEstimate =
  | { type: "own"; priceCents: number; minDays: number; maxDays: number }
  | { type: "drop"; deliveryDays: string }
  | null; // não configurado no admin ainda, ou não deu pra calcular

// estimativa de frete de 1 produto isolado — usada no widget da página do produto.
export async function estimateProductShipping(
  product: Product,
  toCep: string,
): Promise<ProductShippingEstimate> {
  if (product.shippingType === "drop") {
    return { type: "drop", deliveryDays: product.dropDeliveryDays ?? "prazo combinado com o fornecedor" };
  }

  if (product.shippingType === "own") {
    if (!product.weightGrams || !product.lengthCm || !product.widthCm || !product.heightCm) return null;
    const quote = await calculateShipping(toCep, [
      {
        weightGrams: product.weightGrams,
        lengthCm: product.lengthCm,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
        insuranceValueCents: product.priceCents,
        quantity: 1,
      },
    ]);
    if (!quote) return null;
    return { type: "own", priceCents: quote.priceCents, minDays: quote.minDays, maxDays: quote.maxDays };
  }

  return null;
}

export type CartShippingResult = {
  costCents: number;
  daysEstimate: string | null;
};

function formatDaysRange(min: number, max: number): string {
  return min === max ? `${min} dias úteis` : `${min} a ${max} dias úteis`;
}

// estimativa combinada do carrinho inteiro — usada no checkout pra somar ao
// total cobrado. Itens "own" viram um cálculo único (a Melhor Envio já
// consolida o pacote); itens "drop" são sempre grátis, só entram no texto
// de prazo mostrado pro cliente.
export async function estimateCartShipping(
  items: { product: Product; quantity: number }[],
  toCep: string,
): Promise<CartShippingResult> {
  const ownItems = items.filter(
    (i) =>
      i.product.shippingType === "own" &&
      i.product.weightGrams &&
      i.product.lengthCm &&
      i.product.widthCm &&
      i.product.heightCm,
  );
  const dropItems = items.filter((i) => i.product.shippingType === "drop");

  let costCents = 0;
  let ownDaysText: string | null = null;

  if (ownItems.length > 0) {
    const quote = await calculateShipping(
      toCep,
      ownItems.map((i) => ({
        weightGrams: i.product.weightGrams!,
        lengthCm: i.product.lengthCm!,
        widthCm: i.product.widthCm!,
        heightCm: i.product.heightCm!,
        insuranceValueCents: i.product.priceCents,
        quantity: i.quantity,
      })),
    );
    if (quote) {
      costCents = quote.priceCents;
      ownDaysText = formatDaysRange(quote.minDays, quote.maxDays);
    }
  }

  const dropDaysTexts = [
    ...new Set(dropItems.map((i) => i.product.dropDeliveryDays).filter((d): d is string => !!d)),
  ];

  const parts = [ownDaysText, ...dropDaysTexts].filter((p): p is string => !!p);

  return {
    costCents,
    daysEstimate: parts.length > 0 ? parts.join(" · ") : null,
  };
}
