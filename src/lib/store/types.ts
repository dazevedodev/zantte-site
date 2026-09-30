export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "enviado"
  | "entregue"
  | "cancelado";

// variação de cor — cada uma aponta pra uma das fotos do produto, pra
// trocar a imagem em destaque quando o cliente escolhe a cor.
export type ProductVariant = {
  name: string;
  imageUrl: string;
};

// quem despacha o produto: "own" = a própria Zantte (frete calculado de
// verdade via Melhor Envio, a partir do peso/dimensões cadastrados) ou
// "drop" = fornecedor (frete sempre grátis, prazo é texto fixo cadastrado
// à mão porque depende do fornecedor, não dá pra calcular via API).
export type ShippingType = "own" | "drop";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  // preço "de" riscado, opcional — quando preenchido e maior que priceCents,
  // mostra como promoção (de/por) no site.
  compareAtPriceCents: number | null;
  imageUrls: string[];
  videoUrl: string | null;
  variants: ProductVariant[];
  // vendas reais já feitas (em qualquer canal, não só nessa loja) —
  // preenchido à mão no admin, só exibido quando > 0. Nunca inventar esse
  // número: é prova social de verdade ou não aparece.
  unitsSold: number;
  category: string | null;
  // link de compra no fornecedor (dropshipping) — uso interno do admin,
  // nunca exibido nas páginas públicas da loja.
  supplierUrl: string | null;
  // null = ainda não configurado no admin — nesse caso a página do produto
  // não mostra nenhuma informação de frete, pra nunca prometer algo errado.
  shippingType: ShippingType | null;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  // só usado quando shippingType === "drop" — prazo do fornecedor, texto livre.
  dropDeliveryDays: string | null;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  // cor escolhida pelo cliente (quando o produto tem variações) — pra
  // saber qual cor comprar do fornecedor e enviar.
  variantName: string | null;
  // link de compra no fornecedor do produto — só carregado quando buscamos
  // o pedido pro admin, pra ele conseguir comprar e enviar pro cliente.
  supplierUrl?: string | null;
};

export type Order = {
  id: string;
  amountCents: number;
  status: OrderStatus;
  items: OrderItem[];

  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;

  shippingCep: string;
  shippingStreet: string;
  shippingNumber: string;
  shippingComplement: string | null;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;

  trackingCarrier: string | null;
  trackingCode: string | null;
  adminNotes: string | null;

  // frete somado no total no momento da compra — 0 quando o carrinho é só
  // de produtos "drop" (frete grátis) ou quando não deu pra calcular.
  shippingCostCents: number;
  // snapshot do prazo mostrado pro cliente no checkout, pra ficar registrado
  // no pedido mesmo que o produto/config mude depois.
  shippingDaysEstimate: string | null;

  mpPreferenceId: string | null;
  mpInitPoint: string | null;
  mpPaymentId: string | null;
  mpStatusDetail: string | null;

  // Pix gerado direto (fora do checkout hospedado da MP) — fica salvo aqui
  // pra sobreviver o cliente saindo da tela: a página do pedido sempre
  // consegue mostrar o mesmo código de novo, em vez de perder ele.
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  pixExpiresAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  aguardando_pagamento: "aguardando pagamento",
  pago: "pago",
  enviado: "enviado",
  entregue: "entregue",
  cancelado: "cancelado",
};
