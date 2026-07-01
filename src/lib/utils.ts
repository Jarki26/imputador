export * from './dateUtils';
export * from './taskUtils';
export * from './uiUtils';

/**
 * Reloads the current page.
 */
export function reloadPage(): void {
  window.location.reload();
}

/**
 * Formats a decimal hours value into HH:MM format.
 * Examples: 2.5 -> "02:30", 26.5 -> "26:30"
 */
export function formatHoursToHHMM(decimalHours: number): string {
  if (isNaN(decimalHours) || decimalHours < 0) {
    return "00:00";
  }
  
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}`;
}
