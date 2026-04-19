import type { SesameCheck } from './sesameService';
import type { Task } from './db';
import { i18n } from './i18n.svelte';

/**
 * Calculates gaps between check-out and the next check-in, 
 * plus OFFLINE boundaries at the start and end of the day.
 */
export function calculateGapsFromChecks(checks: SesameCheck[]): Task[] {
  const gaps: Task[] = [];

  if (checks.length === 0) {
    return gaps;
  }

  // Group checks by day to ensure we only calculate gaps within each day
  const checksByDay: Record<string, SesameCheck[]> = {};

  for (const check of checks) {
    const day = check.checkIn.date.split('T')[0];
    if (!checksByDay[day]) {
      checksByDay[day] = [];
    }
    checksByDay[day].push(check);
  }

  for (const day in checksByDay) {
    const dayChecks = checksByDay[day].sort(
      (a, b) =>
        new Date(a.checkIn.date).getTime() - new Date(b.checkIn.date).getTime(),
    );

    // 1. Boundary: Start of day to first check-in
    const firstCheck = dayChecks[0];
    const firstCheckIn = new Date(firstCheck.checkIn.date);
    const dayStart = new Date(firstCheckIn);
    dayStart.setHours(0, 0, 0, 0);

    if (firstCheckIn.getTime() - dayStart.getTime() > 60000) {
      gaps.push({
        title: i18n.t('task.type_offline'),
        description: i18n.t('task.offline_description'),
        project: 'sesame',
        type: 'OFFLINE',
        startTime: dayStart,
        endTime: firstCheckIn,
      });
    }

    // 2. Internal gaps (REST)
    for (let i = 0; i < dayChecks.length - 1; i++) {
      const currentCheck = dayChecks[i];
      const nextCheck = dayChecks[i + 1];

      if (currentCheck.checkOut && currentCheck.checkOut.date) {
        const gapStart = new Date(currentCheck.checkOut.date);
        const gapEnd = new Date(nextCheck.checkIn.date);

        // Only add if there's an actual gap (more than 1 minute)
        if (gapEnd.getTime() - gapStart.getTime() > 60000) {
          gaps.push({
            title: i18n.t('task.type_rest'),
            description: '',
            project: 'sesame',
            type: 'REST',
            startTime: gapStart,
            endTime: gapEnd,
          });
        }
      }
    }

    // 3. Boundary: Last check-out to end of day
    const lastCheck = dayChecks[dayChecks.length - 1];
    if (lastCheck.checkOut && lastCheck.checkOut.date) {
      const lastCheckOut = new Date(lastCheck.checkOut.date);
      const dayEnd = new Date(lastCheckOut);
      dayEnd.setHours(23, 59, 59, 0); // Using 23:59:59 as boundary

      if (dayEnd.getTime() - lastCheckOut.getTime() > 60000) {
        gaps.push({
          title: i18n.t('task.type_offline'),
          description: i18n.t('task.offline_description'),
          project: 'sesame',
          type: 'OFFLINE',
          startTime: lastCheckOut,
          endTime: dayEnd,
        });
      }
    }
  }

  // Sort all gaps by startTime
  return gaps.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

/**
 * Syncs a list of rest tasks with the task store, applying collision rules.
 * 1. Skip if identical rest task exists.
 * 2. Overwrite if conflicting rest task exists.
 * 3. Allow overlap if conflicting with other task types.
 */
export async function syncSesameTasks(newRestTasks: Task[], taskStore: any): Promise<void> {
  for (const newRestTask of newRestTasks) {
    // Get all tasks for the day to check for collisions accurately
    const existingTasks = await taskStore.getTasksForDay(newRestTask.startTime);

    let skipInsertion = false;
    const tasksToOverwrite: number[] = [];

    const newStart = newRestTask.startTime.getTime();
    const newEnd = newRestTask.endTime.getTime();

    for (const existingTask of existingTasks) {
      const exStart = existingTask.startTime.getTime();
      const exEnd = existingTask.endTime.getTime();

      // Check for ANY overlap
      const hasOverlap = (newStart < exEnd && newEnd > exStart);

      if (!hasOverlap) continue;

      const isSesameTask =
        existingTask.project === 'sesame' &&
        (existingTask.type === 'REST' || existingTask.type === 'OFFLINE');

      if (isSesameTask) {
        const isIdentical =
          exStart === newStart &&
          exEnd === newEnd &&
          existingTask.type === newRestTask.type;

        if (isIdentical) {
          skipInsertion = true;
          break;
        } else {
          // Conflict with existing Sesame task -> Overwrite it
          if (existingTask.id) tasksToOverwrite.push(existingTask.id);
        }
      }
      // If it's NOT a sesame task, we ignore it (rule 3: allow overlap)
    }

    if (!skipInsertion) {
      // Delete conflicting Sesame tasks
      for (const id of tasksToOverwrite) {
        await taskStore.deleteTask(id);
      }
      // Insert new Sesame task
      await taskStore.addTask(newRestTask);
    }
  }
}
