import { listFinancialEntries } from "@/lib/finance";
import { calendarWindow } from "@/lib/finance-calendar";
import { CashFlowCalendar } from "./cash-flow-calendar";

export const dynamic = "force-dynamic";

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
