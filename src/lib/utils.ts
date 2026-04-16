import type { Task } from './db';
import { isBillable, countsTowardGoal } from './config';

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

/**
 * Reloads the current page.
 */
export function reloadPage(): void {
  window.location.reload();
}
export function calculateTotalHours(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    if (countsTowardGoal(task.type)) {
      const diff = task.endTime.getTime() - task.startTime.getTime();
      return total + diff / (1000 * 60 * 60);
    }
    return total;
  }, 0);
}

/**
 * Calculates ONLY active work hours (billable).
 */
export function calculateWorkHours(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    if (isBillable(task.type)) {
      const diff = task.endTime.getTime() - task.startTime.getTime();
      return total + diff / (1000 * 60 * 60);
    }
    return total;
  }, 0);
}

/**
 * Calculates hours for tasks that count toward goal but are NOT active work (e.g. Ausencia Facturable).
 */
export function calculateGoalAbsenceHours(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    if (countsTowardGoal(task.type) && !isBillable(task.type)) {
      const diff = task.endTime.getTime() - task.startTime.getTime();
      return total + diff / (1000 * 60 * 60);
    }
    return total;
  }, 0);
}

/**
 * Calculates the vertical position (top) in pixels for a given time.
 * Assumes time is within the day being rendered.
 * @param date The date/time to calculate position for.
 * @param pixelsPerMinute The current (zoomed) pixels per minute.
 */
export function calculateVerticalPosition(date: Date, pixelsPerMinute: number): number {
  const minutesSinceStartOfDay = date.getHours() * 60 + date.getMinutes();
  return minutesSinceStartOfDay * pixelsPerMinute;
}

/**
 * Calculates the height in pixels for a given duration in minutes.
 * @param durationInMinutes Duration of the task in minutes.
 * @param pixelsPerMinute The current (zoomed) pixels per minute.
 */
export function calculateHeight(durationInMinutes: number, pixelsPerMinute: number): number {
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
