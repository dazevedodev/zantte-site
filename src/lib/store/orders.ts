import { sql } from "./db";
import type { Order, OrderItem, OrderStatus } from "./types";

type OrderRow = {
  id: string;
  amount_cents: number;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  shipping_cep: string;
  shipping_street: string;
  shipping_number: string;
  shipping_complement: string | null;
  shipping_neighborhood: string;
  shipping_city: string;
  shipping_state: string;
  tracking_carrier: string | null;
  tracking_code: string | null;
  admin_notes: string | null;
  shipping_cost_cents: number;
  shipping_days_estimate: string | null;
  mp_preference_id: string | null;
  mp_init_point: string | null;
  mp_payment_id: string | null;
  mp_status_detail: string | null;
  pix_qr_code: string | null;
  pix_qr_code_base64: string | null;
  pix_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  variant_name: string | null;
  supplier_url?: string | null;
};

function mapOrder(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    amountCents: row.amount_cents,
    status: row.status,
    items,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerCpf: row.customer_cpf,
    shippingCep: row.shipping_cep,
    shippingStreet: row.shipping_street,
    shippingNumber: row.shipping_number,
    shippingComplement: row.shipping_complement,
    shippingNeighborhood: row.shipping_neighborhood,
    shippingCity: row.shipping_city,
    shippingState: row.shipping_state,
    trackingCarrier: row.tracking_carrier,
    trackingCode: row.tracking_code,
    adminNotes: row.admin_notes,
    shippingCostCents: row.shipping_cost_cents ?? 0,
    shippingDaysEstimate: row.shipping_days_estimate,
    mpPreferenceId: row.mp_preference_id,
    mpInitPoint: row.mp_init_point,
    mpPaymentId: row.mp_payment_id,
    mpStatusDetail: row.mp_status_detail,
    pixQrCode: row.pix_qr_code,
    pixQrCodeBase64: row.pix_qr_code_base64,
    pixExpiresAt: row.pix_expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
    lineTotalCents: row.line_total_cents,
    variantName: row.variant_name,
    supplierUrl: row.supplier_url ?? null,
  };
}

async function fetchItemsForOrder(orderId: string): Promise<OrderItem[]> {
  const rows = (await sql`
    select oi.*, p.supplier_url
    from order_items oi
    join products p on p.id = oi.product_id
    where oi.order_id = ${orderId}
    order by oi.id
  `) as OrderItemRow[];
  return rows.map(mapOrderItem);
}

export type CreateOrderInput = {
  items: {
    productId: string;
    productName: string;
    unitPriceCents: number;
    quantity: number;
    variantName: string | null;
  }[];
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
  shippingCostCents: number;
  shippingDaysEstimate: string | null;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const amountCents =
    input.items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0) + input.shippingCostCents;

  const rows = (await sql`
    insert into orders (
      amount_cents, customer_name, customer_email, customer_phone, customer_cpf,
      shipping_cep, shipping_street, shipping_number, shipping_complement,
      shipping_neighborhood, shipping_city, shipping_state,
      shipping_cost_cents, shipping_days_estimate
    ) values (
      ${amountCents}, ${input.customerName}, ${input.customerEmail}, ${input.customerPhone}, ${input.customerCpf},
      ${input.shippingCep}, ${input.shippingStreet}, ${input.shippingNumber}, ${input.shippingComplement},
      ${input.shippingNeighborhood}, ${input.shippingCity}, ${input.shippingState},
      ${input.shippingCostCents}, ${input.shippingDaysEstimate}
    )
    returning *
  `) as OrderRow[];
  const orderRow = rows[0];

  const items: OrderItem[] = [];
  for (const item of input.items) {
    const lineTotalCents = item.unitPriceCents * item.quantity;
    const itemRows = (await sql`
      insert into order_items (order_id, product_id, product_name, unit_price_cents, quantity, line_total_cents, variant_name)
      values (${orderRow.id}, ${item.productId}, ${item.productName}, ${item.unitPriceCents}, ${item.quantity}, ${lineTotalCents}, ${item.variantName})
      returning *
    `) as OrderItemRow[];
    items.push(mapOrderItem(itemRows[0]));
  }

  return mapOrder(orderRow, items);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const rows = (await sql`select * from orders where id = ${id} limit 1`) as OrderRow[];
  if (!rows[0]) return null;
  const items = await fetchItemsForOrder(id);
  return mapOrder(rows[0], items);
}

export async function listOrdersAdmin(
  status?: OrderStatus,
): Promise<(Order & { itemCount: number })[]> {
  const rows = (
    status
      ? await sql`select * from orders where status = ${status} order by created_at desc`
      : await sql`select * from orders order by created_at desc`
  ) as OrderRow[];

  const withItems = await Promise.all(
    rows.map(async (row) => {
      const itemRows = (await sql`
        select count(*)::int as count from order_items where order_id = ${row.id}
      `) as { count: number }[];
      return { ...mapOrder(row, []), itemCount: itemRows[0]?.count ?? 0 };
    }),
  );
  return withItems;
}

export async function setOrderPreference(
  id: string,
  mpPreferenceId: string,
  mpInitPoint: string,
): Promise<void> {
  await sql`
    update orders
    set mp_preference_id = ${mpPreferenceId}, mp_init_point = ${mpInitPoint}, updated_at = now()
    where id = ${id}
  `;
}

export async function setOrderPixPayment(
  id: string,
  input: { mpPaymentId: string; pixQrCode: string; pixQrCodeBase64: string; pixExpiresAt: string },
): Promise<void> {
  await sql`
    update orders
    set mp_payment_id = ${input.mpPaymentId},
        pix_qr_code = ${input.pixQrCode},
        pix_qr_code_base64 = ${input.pixQrCodeBase64},
        pix_expires_at = ${input.pixExpiresAt},
        updated_at = now()
    where id = ${id}
  `;
}

/**
 * Idempotente: o webhook da MP pode chamar mais de uma vez pro mesmo pagamento.
 * Só aplica a transição se o pedido ainda estiver aguardando pagamento.
 */
export async function markOrderPaid(
  id: string,
  mpPaymentId: string,
  mpStatusDetail: string,
): Promise<boolean> {
  const rows = (await sql`
    update orders
    set status = 'pago', mp_payment_id = ${mpPaymentId}, mp_status_detail = ${mpStatusDetail}, updated_at = now()
    where id = ${id} and status = 'aguardando_pagamento'
    returning id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function setOrderShipped(
  id: string,
  trackingCarrier: string,
  trackingCode: string,
): Promise<void> {
  await sql`
    update orders
    set status = 'enviado', tracking_carrier = ${trackingCarrier}, tracking_code = ${trackingCode}, updated_at = now()
    where id = ${id}
  `;
}

export async function setOrderDelivered(id: string): Promise<void> {
  await sql`update orders set status = 'entregue', updated_at = now() where id = ${id}`;
}

export async function cancelOrder(id: string): Promise<void> {
  await sql`update orders set status = 'cancelado', updated_at = now() where id = ${id}`;
}

export async function setOrderNotes(id: string, notes: string): Promise<void> {
  await sql`update orders set admin_notes = ${notes}, updated_at = now() where id = ${id}`;
}

/**
 * Apaga de vez — usado só pra limpar pedido de teste (nunca em pedido
 * pago de cliente de verdade). Remove os itens antes por causa da FK.
 */
export async function deleteOrder(id: string): Promise<void> {
  await sql`delete from order_items where order_id = ${id}`;
  await sql`delete from orders where id = ${id}`;
}
