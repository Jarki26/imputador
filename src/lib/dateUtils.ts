/**
 * Formats a Date object to the string format required by HTML datetime-local inputs:
 * YYYY-MM-DDTHH:mm
 */
export function formatDateForInput(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateOnlyForInput(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Formats a Date object to HH:mm
 */
export function formatTimeOnlyForInput(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Parses a date string (YYYY-MM-DD) into a Date object at the start of that day (00:00:00).
 */
export function parseStartDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Parses a date string (YYYY-MM-DD) into a Date object at the end of that day (23:59:59).
 */
export function parseEndDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}
