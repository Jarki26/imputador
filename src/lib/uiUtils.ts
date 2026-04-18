/**
 * Calculates the vertical position (top) in pixels for a given time.
 * Assumes time is within the day being rendered.
 * @param date The date/time to calculate position for.
 * @param pixelsPerMinute The current (zoomed) pixels per minute.
 */
export function calculateVerticalPosition(
  date: Date,
  pixelsPerMinute: number,
): number {
  const minutesSinceStartOfDay = date.getHours() * 60 + date.getMinutes();
  return minutesSinceStartOfDay * pixelsPerMinute;
}

/**
 * Calculates the height in pixels for a given duration in minutes.
 * @param durationInMinutes Duration of the task in minutes.
 * @param pixelsPerMinute The current (zoomed) pixels per minute.
 */
export function calculateHeight(
  durationInMinutes: number,
  pixelsPerMinute: number,
): number {
  return durationInMinutes * pixelsPerMinute;
}

/**
 * Returns 'white' or 'black' depending on the luminance of the provided hex color.
 */
export function getContrastColor(hex: string): 'white' | 'black' {
  if (!hex || hex.length < 7) return 'black';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}
