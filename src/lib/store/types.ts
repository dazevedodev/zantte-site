export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "enviado"
  | "entregue"
  | "cancelado";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrls: string[];
  category: string | null;
  // link de compra no fornecedor (dropshipping) — uso interno do admin,
  // nunca exibido nas páginas públicas da loja.
  supplierUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  productId: string;
  productName: string;
  productPriceCents: number;
  quantity: number;
  amountCents: number;
  status: OrderStatus;

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

  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  mpStatusDetail: string | null;

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
