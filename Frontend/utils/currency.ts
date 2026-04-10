export function formatTk(value: number | string | null | undefined): string {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const roundedValue = Math.round(safeValue);

  return `Tk ${roundedValue.toLocaleString('en-BD')}`;
}
