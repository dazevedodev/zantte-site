"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/store/session";
import { createProduct, updateProduct, setProductActive } from "@/lib/store/products";
import { uploadProductImage } from "@/lib/store/blob";
import { slugify } from "@/lib/store/format";

export type ProductFormState = { error: string } | null;

async function collectImageUrls(formData: FormData, existing: string[]): Promise<string[]> {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const uploaded = await Promise.all(files.map(uploadProductImage));
  return [...existing, ...uploaded];
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const name = formData.get("name");
  const description = formData.get("description");
  const price = formData.get("priceReais");

  if (typeof name !== "string" || !name.trim()) return { error: "nome obrigatório" };
  if (typeof price !== "string" || !price.trim()) return { error: "preço obrigatório" };

  const priceCents = Math.round(Number(price.replace(",", ".")) * 100);
  if (!Number.isFinite(priceCents) || priceCents <= 0) return { error: "preço inválido" };

  const imageUrls = await collectImageUrls(formData, []);

  const product = await createProduct({
    slug: `${slugify(name)}-${Date.now().toString(36)}`,
    name: name.trim(),
    description: typeof description === "string" ? description.trim() : "",
    priceCents,
    imageUrls,
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  redirect(`/admin/produtos/${product.id}`);
}

export async function updateProductAction(
  productId: string,
  existingImageUrls: string[],
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const name = formData.get("name");
  const description = formData.get("description");
  const price = formData.get("priceReais");

  if (typeof name !== "string" || !name.trim()) return { error: "nome obrigatório" };
  if (typeof price !== "string" || !price.trim()) return { error: "preço obrigatório" };

  const priceCents = Math.round(Number(price.replace(",", ".")) * 100);
  if (!Number.isFinite(priceCents) || priceCents <= 0) return { error: "preço inválido" };

  const imageUrls = await collectImageUrls(formData, existingImageUrls);

  await updateProduct(productId, {
    name: name.trim(),
    description: typeof description === "string" ? description.trim() : "",
    priceCents,
    imageUrls,
  });

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/loja");
  return null;
}

export async function setProductActiveAction(productId: string, active: boolean): Promise<void> {
  if (!(await verifyAdminSession())) return;
  await setProductActive(productId, active);
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/loja");
}
