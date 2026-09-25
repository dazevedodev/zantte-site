"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/store/session";
import {
  createProduct,
  updateProduct,
  setProductActive,
  setProductFeatured,
  deleteProduct,
} from "@/lib/store/products";
import { uploadProductImage, uploadProductVideo } from "@/lib/store/blob";
import { slugify } from "@/lib/store/format";
import type { ProductVariant, ShippingType } from "@/lib/store/types";
import type { ProductShippingInput } from "@/lib/store/products";

export type ProductFormState = { error: string } | null;

async function collectNewImageUrls(formData: FormData): Promise<string[]> {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  return Promise.all(files.map(uploadProductImage));
}

function existingImageUrlsFromForm(formData: FormData): string[] {
  const raw = formData.get("existingImageUrls");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === "string") : [];
  } catch {
    return [];
  }
}

async function resolveVideoUrl(formData: FormData): Promise<string | null> {
  const file = formData.get("video");
  if (file instanceof File && file.size > 0) return uploadProductVideo(file);
  const removed = formData.get("removeVideo") === "true";
  if (removed) return null;
  const existing = formData.get("existingVideoUrl");
  return typeof existing === "string" && existing.trim() ? existing.trim() : null;
}

function variantsFromForm(formData: FormData): ProductVariant[] {
  const raw = formData.get("variants");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is ProductVariant =>
        v && typeof v.name === "string" && v.name.trim() && typeof v.imageUrl === "string" && v.imageUrl.trim(),
    );
  } catch {
    return [];
  }
}

function optionalField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePriceCents(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const cents = Math.round(Number(value.replace(",", ".")) * 100);
  return Number.isFinite(cents) && cents > 0 ? cents : null;
}

function parseUnitsSold(formData: FormData): number {
  const value = formData.get("unitsSold");
  if (typeof value !== "string" || !value.trim()) return 0;
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parsePositiveInt(formData: FormData, name: string): number | null {
  const value = formData.get(name);
  if (typeof value !== "string" || !value.trim()) return null;
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function shippingInputFromForm(formData: FormData): ProductShippingInput {
  const raw = formData.get("shippingType");
  const shippingType: ShippingType | null = raw === "own" || raw === "drop" ? raw : null;

  return {
    shippingType,
    weightGrams: shippingType === "own" ? parsePositiveInt(formData, "weightGrams") : null,
    lengthCm: shippingType === "own" ? parsePositiveInt(formData, "lengthCm") : null,
    widthCm: shippingType === "own" ? parsePositiveInt(formData, "widthCm") : null,
    heightCm: shippingType === "own" ? parsePositiveInt(formData, "heightCm") : null,
    dropDeliveryDays: shippingType === "drop" ? optionalField(formData, "dropDeliveryDays") : null,
  };
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) return { error: "nome obrigatório" };

  const priceCents = parsePriceCents(formData.get("priceReais"));
  if (!priceCents) return { error: "preço inválido" };

  const compareAtPriceCents = parsePriceCents(formData.get("compareAtPriceReais"));
  if (compareAtPriceCents !== null && compareAtPriceCents <= priceCents) {
    return { error: "o preço promocional riscado precisa ser maior que o preço de venda" };
  }

  const description = formData.get("description");
  const newImageUrls = await collectNewImageUrls(formData);
  const videoUrl = await resolveVideoUrl(formData);

  let productId: string;
  try {
    const product = await createProduct({
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      priceCents,
      compareAtPriceCents,
      imageUrls: newImageUrls,
      videoUrl,
      variants: variantsFromForm(formData),
      unitsSold: parseUnitsSold(formData),
      category: optionalField(formData, "category"),
      supplierUrl: optionalField(formData, "supplierUrl"),
      ...shippingInputFromForm(formData),
    });
    productId = product.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `erro ao salvar: ${message}` };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  redirect(`/admin/produtos/${productId}`);
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) return { error: "nome obrigatório" };

  const priceCents = parsePriceCents(formData.get("priceReais"));
  if (!priceCents) return { error: "preço inválido" };

  const compareAtPriceCents = parsePriceCents(formData.get("compareAtPriceReais"));
  if (compareAtPriceCents !== null && compareAtPriceCents <= priceCents) {
    return { error: "o preço promocional riscado precisa ser maior que o preço de venda" };
  }

  const description = formData.get("description");
  const newImageUrls = await collectNewImageUrls(formData);
  const imageUrls = [...existingImageUrlsFromForm(formData), ...newImageUrls];
  const videoUrl = await resolveVideoUrl(formData);

  try {
    await updateProduct(productId, {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      priceCents,
      compareAtPriceCents,
      imageUrls,
      videoUrl,
      variants: variantsFromForm(formData),
      unitsSold: parseUnitsSold(formData),
      category: optionalField(formData, "category"),
      supplierUrl: optionalField(formData, "supplierUrl"),
      ...shippingInputFromForm(formData),
    });
  } catch (err) {
    // sem isso, um erro real do banco ficava mudo — a tela não mudava e
    // parecia que "salvar" não fazia nada.
    const message = err instanceof Error ? err.message : String(err);
    return { error: `erro ao salvar: ${message}` };
  }

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

export async function setProductFeaturedAction(productId: string, featured: boolean): Promise<void> {
  if (!(await verifyAdminSession())) return;
  await setProductFeatured(productId, featured);
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/loja");
}

export type DeleteProductState = { error: string } | null;

// assinatura (prevState, formData) exigida pelo useActionState no client,
// mesmo sem usar nenhum dos dois aqui.
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function deleteProductAction(
  productId: string,
  _prevState: DeleteProductState,
  _formData: FormData,
): Promise<DeleteProductState> {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const result = await deleteProduct(productId);
  if (!result.deleted) {
    return { error: result.reason };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  redirect("/admin/produtos");
}
