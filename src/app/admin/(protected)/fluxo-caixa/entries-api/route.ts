import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/store/session";
import { listFinancialEntries } from "@/lib/finance";

// endpoint só pra recarregar os lançamentos do lado do cliente depois de
// criar/marcar/remover — não depende de revalidatePath/router.refresh
// (que não estavam atualizando a tela de forma confiável).
export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "sessão expirada" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json({ error: "start/end obrigatórios" }, { status: 400 });
  }

  const entries = await listFinancialEntries(start, end);
  return NextResponse.json({ entries });
}
