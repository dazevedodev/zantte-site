import { SignJWT, jwtVerify } from "jose";

// Sem "next/headers" aqui de propósito — esse módulo é importado pelo
// proxy.ts, que roda fora do contexto de renderização de rota (next/headers
// só funciona dentro de Server Components/Actions).
export const ADMIN_SESSION_COOKIE_NAME = "zantte_admin_session";
export const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12h

function secretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET!);
}

export async function signAdminToken(expiresAt: Date): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey());
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}
