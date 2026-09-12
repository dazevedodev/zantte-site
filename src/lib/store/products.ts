import { sql } from "./db";
import type { Product, ProductVariant, ShippingType } from "./types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  image_urls: string[];
  video_url: string | null;
  variants: ProductVariant[];
  units_sold: number;
  category: string | null;
  supplier_url: string | null;
  shipping_type: ShippingType | null;
  weight_grams: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  drop_delivery_days: string | null;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    compareAtPriceCents: row.compare_at_price_cents,
    imageUrls: row.image_urls,
    videoUrl: row.video_url,
    variants: row.variants ?? [],
    unitsSold: row.units_sold ?? 0,
    category: row.category,
    supplierUrl: row.supplier_url,
    shippingType: row.shipping_type,
    weightGrams: row.weight_grams,
    lengthCm: row.length_cm,
    widthCm: row.width_cm,
    heightCm: row.height_cm,
    dropDeliveryDays: row.drop_delivery_days,
    featured: row.featured,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listActiveProducts(): Promise<Product[]> {
  const rows = (await sql`
    select * from products where active = true order by created_at desc
  `) as ProductRow[];
  return rows.map(mapProduct);
}

export async function listAllProductsAdmin(): Promise<Product[]> {
  const rows = (await sql`
    select * from products order by created_at desc
  `) as ProductRow[];
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = (await sql`
    select * from products where slug = ${slug} and active = true limit 1
  `) as ProductRow[];
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const rows = (await sql`
    select * from products where id = ${id} limit 1
  `) as ProductRow[];
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getFeaturedProduct(): Promise<Product | null> {
  const rows = (await sql`
    select * from products where featured = true and active = true order by updated_at desc limit 1
  `) as ProductRow[];
  return rows[0] ? mapProduct(rows[0]) : null;
}

export type ProductShippingInput = {
  shippingType: ShippingType | null;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  dropDeliveryDays: string | null;
};

export async function createProduct(
  input: {
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    compareAtPriceCents: number | null;
    imageUrls: string[];
    videoUrl: string | null;
    variants: ProductVariant[];
    unitsSold: number;
    category: string | null;
    supplierUrl: string | null;
  } & ProductShippingInput,
): Promise<Product> {
  const rows = (await sql`
    insert into products (
      slug, name, description, price_cents, compare_at_price_cents, image_urls, video_url,
      variants, units_sold, category, supplier_url,
      shipping_type, weight_grams, length_cm, width_cm, height_cm, drop_delivery_days
    )
    values (
      ${input.slug}, ${input.name}, ${input.description}, ${input.priceCents}, ${input.compareAtPriceCents}, ${input.imageUrls}, ${input.videoUrl},
      ${JSON.stringify(input.variants)}, ${input.unitsSold}, ${input.category}, ${input.supplierUrl},
      ${input.shippingType}, ${input.weightGrams}, ${input.lengthCm}, ${input.widthCm}, ${input.heightCm}, ${input.dropDeliveryDays}
    )
    returning *
  `) as ProductRow[];
  return mapProduct(rows[0]);
}

export async function updateProduct(
  id: string,
  input: {
    name: string;
    description: string;
    priceCents: number;
    compareAtPriceCents: number | null;
    imageUrls: string[];
    videoUrl: string | null;
    variants: ProductVariant[];
    unitsSold: number;
    category: string | null;
    supplierUrl: string | null;
  } & ProductShippingInput,
): Promise<Product> {
  const rows = (await sql`
    update products
    set name = ${input.name},
        description = ${input.description},
        price_cents = ${input.priceCents},
        compare_at_price_cents = ${input.compareAtPriceCents},
        image_urls = ${input.imageUrls},
        video_url = ${input.videoUrl},
        variants = ${JSON.stringify(input.variants)},
        units_sold = ${input.unitsSold},
        category = ${input.category},
        supplier_url = ${input.supplierUrl},
        shipping_type = ${input.shippingType},
        weight_grams = ${input.weightGrams},
        length_cm = ${input.lengthCm},
        width_cm = ${input.widthCm},
        height_cm = ${input.heightCm},
        drop_delivery_days = ${input.dropDeliveryDays},
        updated_at = now()
    where id = ${id}
    returning *
  `) as ProductRow[];
  return mapProduct(rows[0]);
}

export async function setProductActive(id: string, active: boolean): Promise<void> {
  await sql`update products set active = ${active}, updated_at = now() where id = ${id}`;
}

export async function setProductFeatured(id: string, featured: boolean): Promise<void> {
  if (featured) {
    // só 1 produto em destaque por vez — desmarca os outros antes de marcar este.
    await sql`update products set featured = false where featured = true and id != ${id}`;
  }
  await sql`update products set featured = ${featured}, updated_at = now() where id = ${id}`;
}

export type DeleteProductResult = { deleted: true } | { deleted: false; reason: string };

export async function deleteProduct(id: string): Promise<DeleteProductResult> {
  const orderRows = (await sql`
    select count(*)::int as count from order_items where product_id = ${id}
  `) as { count: number }[];

  if ((orderRows[0]?.count ?? 0) > 0) {
    return {
      deleted: false,
      reason: "esse produto já tem pedido vinculado — desative em vez de excluir, pra não perder o histórico.",
    };
  }

  await sql`delete from products where id = ${id}`;
  return { deleted: true };
}
