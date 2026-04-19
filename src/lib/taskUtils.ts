import type { Task } from './db';
import { isBillable, countsTowardGoal } from './config';

/**
 * Calculates total hours for tasks that count toward the goal.
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
 * Calculates ONLY rest hours (not billable and not offline).
 */
export function calculateRestHours(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    if (
      !isBillable(task.type) &&
      task.type !== 'OFFLINE' &&
      task.type !== 'AUSENCIA FACTURABLE'
    ) {
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
