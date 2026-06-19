/** Janela [start, end) do mês (UTC) de uma data — para limites mensais. */
export const monthWindowUTC = (date: Date): { start: Date; end: Date } => {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  return { start: new Date(Date.UTC(y, m, 1)), end: new Date(Date.UTC(y, m + 1, 1)) };
};
