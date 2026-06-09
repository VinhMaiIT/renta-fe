/** Local helpers for `<input type="datetime-local">` <-> ISO conversion. */

/** Convert an ISO/date string to a `YYYY-MM-DDTHH:mm` value for datetime-local. */
export function toDateTimeLocal(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Convert a datetime-local value to an ISO string. */
export function fromDateTimeLocal(value: string): string {
  return new Date(value).toISOString();
}
