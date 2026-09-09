import { sql } from "./db";
import type { Product } from "./types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  image_urls: string[];
  category: string | null;
  supplier_url: string | null;
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
    category: row.category,
    supplierUrl: row.supplier_url,
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

export async function createProduct(input: {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  imageUrls: string[];
  category: string | null;
  supplierUrl: string | null;
}): Promise<Product> {
  const rows = (await sql`
    insert into products (slug, name, description, price_cents, compare_at_price_cents, image_urls, category, supplier_url)
    values (${input.slug}, ${input.name}, ${input.description}, ${input.priceCents}, ${input.compareAtPriceCents}, ${input.imageUrls}, ${input.category}, ${input.supplierUrl})
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
    category: string | null;
    supplierUrl: string | null;
  },
): Promise<Product> {
  const rows = (await sql`
    update products
    set name = ${input.name},
        description = ${input.description},
        price_cents = ${input.priceCents},
        compare_at_price_cents = ${input.compareAtPriceCents},
        image_urls = ${input.imageUrls},
        category = ${input.category},
        supplier_url = ${input.supplierUrl},
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
