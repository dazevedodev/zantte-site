import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, ADMIN_SESSION_COOKIE_NAME } from "@/lib/store/session-token";

// Checagem otimista de sessão pra proteger /admin/**. Cada Server Action de
// mutação repete a verificação de verdade (verifyAdminSession) — isso aqui é
// só pra não deixar a página renderizar sem sessão nenhuma.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const authenticated = await verifyAdminToken(token);

  if (!authenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
