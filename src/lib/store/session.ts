import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_DURATION_MS,
  signAdminToken,
  verifyAdminToken,
} from "./session-token";

export async function createAdminSession() {
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_MS);
  const token = await signAdminToken(expiresAt);

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE_NAME);
}

export async function verifyAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_SESSION_COOKIE_NAME)?.value);
}
