"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/store/session";

export type LoginState = { error: string } | null;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "digite a senha" };
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "senha incorreta" };
  }

  await createAdminSession();
  redirect("/admin/pedidos");
}
