"use server";

import { sendContactFormEmail } from "@/lib/contact-email";

export type ContactFormState = { error?: string; success?: boolean } | null;

export async function submitContactFormAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { error: "preenche seu nome" };
  if (!email && !phone) return { error: "preenche pelo menos um contato (e-mail ou telefone)" };
  if (!message) return { error: "escreve sua mensagem" };

  await sendContactFormEmail({ name, email, phone, message });
  return { success: true };
}
