import { sql } from "./db";
import type { Order, OrderStatus } from "./types";

type OrderRow = {
  id: string;
  product_id: string;
  product_name: string;
  product_price_cents: number;
  quantity: number;
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
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  mp_status_detail: string | null;
  created_at: string;
  updated_at: string;
};

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    productPriceCents: row.product_price_cents,
    quantity: row.quantity,
    amountCents: row.amount_cents,
    status: row.status,
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
    mpPreferenceId: row.mp_preference_id,
    mpPaymentId: row.mp_payment_id,
    mpStatusDetail: row.mp_status_detail,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type CreateOrderInput = {
  productId: string;
  productName: string;
  productPriceCents: number;
  quantity: number;
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
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const amountCents = input.productPriceCents * input.quantity;
  const rows = (await sql`
    insert into orders (
      product_id, product_name, product_price_cents, quantity, amount_cents,
      customer_name, customer_email, customer_phone, customer_cpf,
      shipping_cep, shipping_street, shipping_number, shipping_complement,
      shipping_neighborhood, shipping_city, shipping_state
    ) values (
      ${input.productId}, ${input.productName}, ${input.productPriceCents}, ${input.quantity}, ${amountCents},
      ${input.customerName}, ${input.customerEmail}, ${input.customerPhone}, ${input.customerCpf},
      ${input.shippingCep}, ${input.shippingStreet}, ${input.shippingNumber}, ${input.shippingComplement},
      ${input.shippingNeighborhood}, ${input.shippingCity}, ${input.shippingState}
    )
    returning *
  `) as OrderRow[];
  return mapOrder(rows[0]);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const rows = (await sql`select * from orders where id = ${id} limit 1`) as OrderRow[];
  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function listOrdersAdmin(status?: OrderStatus): Promise<Order[]> {
  const rows = (
    status
      ? await sql`select * from orders where status = ${status} order by created_at desc`
      : await sql`select * from orders order by created_at desc`
  ) as OrderRow[];
  return rows.map(mapOrder);
}

export async function setOrderPreference(id: string, mpPreferenceId: string): Promise<void> {
  await sql`update orders set mp_preference_id = ${mpPreferenceId}, updated_at = now() where id = ${id}`;
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
