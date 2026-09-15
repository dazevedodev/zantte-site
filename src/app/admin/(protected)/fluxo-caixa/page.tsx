import { listFinancialEntries } from "@/lib/finance";
import { CashFlowCalendar } from "./cash-flow-calendar";

export const dynamic = "force-dynamic";

// grade do calendário mostra dias do mês anterior/seguinte pra completar
// semana — busca essa janela inteira (não só o mês "puro") de uma vez.
function calendarWindow(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const gridStart = new Date(first);
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());
  const gridEnd = new Date(last);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(gridStart), end: fmt(gridEnd) };
}

export default async function FluxoCaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params.y) || now.getUTCFullYear();
  const month = Number(params.m) || now.getUTCMonth() + 1;

  const { start, end } = calendarWindow(year, month);
  const entries = await listFinancialEntries(start, end);

  return (
    <section className="admin-page">
      <div className="admin-page-head-row">
        <h1 className="display admin-page-heading">fluxo de caixa</h1>
      </div>
      <CashFlowCalendar year={year} month={month} entries={entries} />
    </section>
  );
}
