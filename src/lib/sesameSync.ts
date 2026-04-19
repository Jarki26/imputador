import type { SesameCheck } from './sesameService';
import type { Task } from './db';

/**
 * Calculates gaps between check-out and the next check-in.
 * Only gaps within the same day are considered (based on the first and last work registry of the day).
 */
export function calculateGapsFromChecks(checks: SesameCheck[]): Task[] {
  const gaps: Task[] = [];
  
  if (checks.length < 2) {
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
    const dayChecks = checksByDay[day].sort((a, b) => 
      new Date(a.checkIn.date).getTime() - new Date(b.checkIn.date).getTime()
    );

    for (let i = 0; i < dayChecks.length - 1; i++) {
      const currentCheck = dayChecks[i];
      const nextCheck = dayChecks[i + 1];

      if (currentCheck.checkOut && currentCheck.checkOut.date) {
        const gapStart = new Date(currentCheck.checkOut.date);
        const gapEnd = new Date(nextCheck.checkIn.date);

        // Only add if there's an actual gap (more than 1 minute)
        if (gapEnd.getTime() - gapStart.getTime() > 60000) {
          gaps.push({
            title: 'Descanso',
            description: '',
            project: 'sesame',
            type: 'REST',
            startTime: gapStart,
            endTime: gapEnd
          });
        }
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

      const isSesameRest = 
        existingTask.title === 'Descanso' && 
        existingTask.project === 'sesame' && 
        existingTask.type === 'REST';

      if (isSesameRest) {
        const isIdentical = exStart === newStart && exEnd === newEnd;

        if (isIdentical) {
          skipInsertion = true;
          break;
        } else {
          // Conflict with existing Sesame Rest task -> Overwrite it
          if (existingTask.id) tasksToOverwrite.push(existingTask.id);
        }
      }
      // If it's NOT a sesame rest task, we ignore it (rule 3: allow overlap)
    }

    if (!skipInsertion) {
      // Delete conflicting Sesame Rest tasks
      for (const id of tasksToOverwrite) {
        await taskStore.deleteTask(id);
      }
      // Insert new Rest task
      await taskStore.addTask(newRestTask);
    }
  }
}
