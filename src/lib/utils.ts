/**
 * Formats a Date object to the string format required by HTML datetime-local inputs:
 * YYYY-MM-DDTHH:mm
 */
export function formatDateForInput(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
