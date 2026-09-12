// Cálculo de frete real via Melhor Envio — só usado pra produtos com
// shippingType "own" (a Zantte que despacha). Produtos "drop" nunca passam
// por aqui: frete grátis, prazo é texto fixo cadastrado no produto.

type MelhorEnvioProductInput = {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  insuranceValueCents: number;
  quantity: number;
};

export type ShippingQuote = {
  priceCents: number;
  minDays: number;
  maxDays: number;
  carrierName: string;
};

type MelhorEnvioOption = {
  price?: string | number | null;
  delivery_time?: number | null;
  delivery_range?: { min?: number; max?: number } | null;
  company?: { name?: string } | null;
  error?: string | null;
};

// dimensões mínimas aceitas pela Melhor Envio — abaixo disso a API rejeita
// o cálculo, então nunca manda menos que isso mesmo se o produto cadastrado
// tiver valores menores ou zerados.
const MIN_CM = 11;
const MIN_WEIGHT_KG = 0.1;

export async function calculateShipping(
  toCep: string,
  products: MelhorEnvioProductInput[],
): Promise<ShippingQuote | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const fromCep = process.env.MELHOR_ENVIO_ORIGIN_CEP;
  if (!token || !fromCep || products.length === 0) return null;

  const body = {
    from: { postal_code: fromCep },
    to: { postal_code: toCep },
    products: products.map((p, i) => ({
      id: String(i),
      width: Math.max(MIN_CM, Math.round(p.widthCm)),
      height: Math.max(MIN_CM, Math.round(p.heightCm)),
      length: Math.max(MIN_CM, Math.round(p.lengthCm)),
      weight: Math.max(MIN_WEIGHT_KG, p.weightGrams / 1000),
      insurance_value: Math.max(0, p.insuranceValueCents / 100),
      quantity: p.quantity,
    })),
  };

  let res: Response;
  try {
    res = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "ZAN CO. (zantte.com.br) - contato@zantte.com.br",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let options: MelhorEnvioOption[];
  try {
    const parsed = (await res.json()) as unknown;
    if (!Array.isArray(parsed)) return null;
    options = parsed as MelhorEnvioOption[];
  } catch {
    return null;
  }

  const valid = options.filter(
    (o) => !o.error && o.price != null && !Number.isNaN(Number(o.price)),
  );
  if (valid.length === 0) return null;

  const cheapest = valid.reduce((min, o) => (Number(o.price) < Number(min.price) ? o : min));

  const min = cheapest.delivery_range?.min ?? cheapest.delivery_time ?? 0;
  const max = cheapest.delivery_range?.max ?? cheapest.delivery_time ?? min;

  return {
    priceCents: Math.round(Number(cheapest.price) * 100),
    minDays: min,
    maxDays: max,
    carrierName: cheapest.company?.name ?? "transportadora",
  };
}
