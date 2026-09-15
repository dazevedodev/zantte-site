// compartilhado entre o server (page.tsx, busca inicial) e o client
// (cash-flow-calendar.tsx, recarrega depois de criar/marcar/remover) —
// os dois precisam calcular exatamente a mesma janela (mês + dias de
// borda dos meses vizinhos que completam a semana da grade).
export function calendarWindow(year: number, month1: number) {
  const first = new Date(Date.UTC(year, month1 - 1, 1));
  const last = new Date(Date.UTC(year, month1, 0));
  const gridStart = new Date(first);
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());
  const gridEnd = new Date(last);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(gridStart), end: fmt(gridEnd) };
}
