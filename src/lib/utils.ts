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
 * Calculates the total hours from a list of tasks, excluding non-billable types.
 * "Billable" here refers to everything that counts towards the weekly goal.
 */
export function calculateTotalHours(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    if (countsTowardGoal(task.type)) {
      const diff = task.endTime.getTime() - task.startTime.getTime();
      return total + diff / (1000 * 60 * 60);
    }
    return total;
  }, 0);
}
