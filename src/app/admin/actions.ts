"use server";

import { redirect } from "next/navigation";
import { deleteAdminSession } from "@/lib/store/session";

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/admin/login");
}
