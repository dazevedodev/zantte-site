import { sql } from "./db";
import type { Product } from "./types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  image_urls: string[];
  category: string | null;
  supplier_url: string | null;
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
    imageUrls: row.image_urls,
    category: row.category,
    supplierUrl: row.supplier_url,
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

export async function createProduct(input: {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrls: string[];
  category: string | null;
  supplierUrl: string | null;
}): Promise<Product> {
  const rows = (await sql`
    insert into products (slug, name, description, price_cents, image_urls, category, supplier_url)
    values (${input.slug}, ${input.name}, ${input.description}, ${input.priceCents}, ${input.imageUrls}, ${input.category}, ${input.supplierUrl})
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
