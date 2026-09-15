"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/store/session";
import { createFinancialEntry, setFinancialEntryPaid, deleteFinancialEntry } from "@/lib/finance";

export type FinanceFormState = { error: string } | null;

function parseAmountCents(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const cents = Math.round(Number(value.replace(",", ".")) * 100);
  return Number.isFinite(cents) && cents > 0 ? cents : null;
}

export async function createFinancialEntryAction(
  _prevState: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  if (!(await verifyAdminSession())) return { error: "sessão expirada" };

  const kind = formData.get("kind");
  if (kind !== "entrada" && kind !== "saida") return { error: "tipo inválido" };

  const description = formData.get("description");
  if (typeof description !== "string" || !description.trim()) return { error: "descrição obrigatória" };

  const amountCents = parseAmountCents(formData.get("amount"));
  if (!amountCents) return { error: "valor inválido" };

  const dueDate = formData.get("dueDate");
  if (typeof dueDate !== "string" || !dueDate.trim()) return { error: "data obrigatória" };

  await createFinancialEntry({
    kind,
    description: description.trim(),
    amountCents,
    dueDate,
    paid: formData.get("paid") === "true",
  });

  revalidatePath("/admin/fluxo-caixa");
  return null;
}

export async function setFinancialEntryPaidAction(id: string, paid: boolean): Promise<void> {
  if (!(await verifyAdminSession())) return;
  await setFinancialEntryPaid(id, paid);
  revalidatePath("/admin/fluxo-caixa");
}

export async function deleteFinancialEntryAction(id: string): Promise<void> {
  if (!(await verifyAdminSession())) return;
  await deleteFinancialEntry(id);
  revalidatePath("/admin/fluxo-caixa");
}
