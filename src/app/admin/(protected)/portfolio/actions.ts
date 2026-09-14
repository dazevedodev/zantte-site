"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/store/session";
import {
  createPortfolioProject,
  updatePortfolioProject,
  setPortfolioProjectActive,
  deletePortfolioProject,
} from "@/lib/portfolio";
import { uploadPortfolioCover } from "@/lib/store/blob";

export type PortfolioFormState = { error: string } | null;

function optionalField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

// sem "https://" o link vira um caminho relativo do próprio site em vez
// de abrir o site externo — normaliza aqui pra nunca salvar assim.
function optionalUrlField(formData: FormData, name: string): string | null {
  const value = optionalField(formData, name);
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

async function resolveCoverUrl(formData: FormData): Promise<string | null> {
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) return uploadPortfolioCover(file);
  const removed = formData.get("removeCover") === "true";
  if (removed) return null;
  const existing = formData.get("existingCoverUrl");
  return typeof existing === "string" && existing.trim() ? existing.trim() : null;
}

export async function createPortfolioProjectAction(
  _prevState: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) return { error: "nome obrigatório" };

  const coverUrl = await resolveCoverUrl(formData);

  const project = await createPortfolioProject({
    name: name.trim(),
    tagline: optionalField(formData, "tagline"),
    url: optionalUrlField(formData, "url"),
    coverUrl,
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect(`/admin/portfolio/${project.id}`);
}

export async function updatePortfolioProjectAction(
  projectId: string,
  _prevState: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) return { error: "nome obrigatório" };

  const coverUrl = await resolveCoverUrl(formData);

  await updatePortfolioProject(projectId, {
    name: name.trim(),
    tagline: optionalField(formData, "tagline"),
    url: optionalUrlField(formData, "url"),
    coverUrl,
  });

  revalidatePath("/admin/portfolio");
  revalidatePath(`/admin/portfolio/${projectId}`);
  revalidatePath("/portfolio");
  return null;
}

export async function setPortfolioProjectActiveAction(projectId: string, active: boolean): Promise<void> {
  if (!(await verifyAdminSession())) return;
  await setPortfolioProjectActive(projectId, active);
  revalidatePath("/admin/portfolio");
  revalidatePath(`/admin/portfolio/${projectId}`);
  revalidatePath("/portfolio");
}

export type DeletePortfolioProjectState = { error: string } | null;

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function deletePortfolioProjectAction(
  projectId: string,
  _prevState: DeletePortfolioProjectState,
  _formData: FormData,
): Promise<DeletePortfolioProjectState> {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  await deletePortfolioProject(projectId);

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}
