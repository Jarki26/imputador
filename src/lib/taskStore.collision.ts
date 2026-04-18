import type { Task } from './db';

/**
 * Applies overwrite logic: splits or deletes existing tasks that collide with the new task.
 */
export async function applyOverwriteLogic(
  newTask: Task,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any,
  excludeId?: number,
): Promise<void> {
  const index = store.index('date');

  // Get all tasks for the day
  const startOfDay = new Date(newTask.startTime);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(newTask.startTime);
  endOfDay.setHours(23, 59, 59, 999);
  const range = IDBKeyRange.bound(startOfDay, endOfDay);
  const tasks: Task[] = await index.getAll(range);

  const newStart = newTask.startTime.getTime();
  const newEnd = newTask.endTime.getTime();

  for (const task of tasks) {
    if (!task.id || task.id === excludeId) continue;

    const oldStart = task.startTime.getTime();
    const oldEnd = task.endTime.getTime();

    // Check for overlap
    if (oldStart < newEnd && oldEnd > newStart) {
      if (oldStart >= newStart && oldEnd <= newEnd) {
        // Complete overlap: Delete existing task
        await store.delete(task.id);
      } else if (oldStart < newStart && oldEnd > newEnd) {
        // Middle overlap: Split existing task
        const taskBefore = { ...task, endTime: new Date(newStart) };
        const taskAfterData = { ...task };
        delete taskAfterData.id;
        const taskAfter = {
          ...taskAfterData,
          startTime: new Date(newEnd),
        };
        await store.put(taskBefore);
        await store.add(taskAfter);
      } else if (oldStart < newStart && oldEnd > newStart) {
        // Truncate end of existing task
        await store.put({ ...task, endTime: new Date(newStart) });
      } else if (oldStart < newEnd && oldEnd > newEnd) {
        // Truncate start of existing task
        await store.put({ ...task, startTime: new Date(newEnd) });
      }
    }
  }
}

/**
 * Recursively shifts tasks that overlap with the given range.
 */
export async function pushConflict(
  start: number,
  end: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any,
  excludeIds: number[] = [],
): Promise<void> {
  const index = store.index('date');
  // Get all tasks for the day (to be safe, though we could optimize with range)
  const startOfDay = new Date(start);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(start);
  endOfDay.setHours(23, 59, 59, 999);
  const range = IDBKeyRange.bound(startOfDay, endOfDay);
  const tasks: Task[] = await index.getAll(range);

  for (const oldTask of tasks) {
    if (!oldTask.id || excludeIds.includes(oldTask.id)) continue;

    // Fetch the latest version of the task as it might have been shifted by a recursive call
    const task = await store.get(oldTask.id);
    if (!task) continue;

    const oldStart = task.startTime.getTime();
    const oldEnd = task.endTime.getTime();

    // Check for overlap with the pushing range [start, end]
    if (oldStart < end && oldEnd > start) {
      if (oldStart < start) {
        // Split task
        const taskBefore = { ...task, endTime: new Date(start) };
        const shiftDuration = oldEnd - start;
        const newStart = end;
        const newEnd = end + shiftDuration;

        await store.put(taskBefore);

        const taskAfterData = { ...task };
        delete taskAfterData.id;
        const taskAfter = {
          ...taskAfterData,
          startTime: new Date(newStart),
          endTime: new Date(newEnd),
        };

        // Recursively push what this new part might collide with
        // Note: taskAfter doesn't have an ID yet, so we can't exclude it here,
        // but pushConflict will check the DB, and taskAfter isn't in the DB yet.
        await pushConflict(newStart, newEnd, store, excludeIds);
        await store.add(taskAfter);
      } else {
        // Shift whole task
        const duration = oldEnd - oldStart;
        const newStart = end;
        const newEnd = end + duration;

        const updatedTask = {
          ...task,
          startTime: new Date(newStart),
          endTime: new Date(newEnd),
        };
        await store.put(updatedTask);

        // Recursively push what this shifted task might collide with
        // excludeIds is important here to not push 'updatedTask' again
        await pushConflict(newStart, newEnd, store, [...excludeIds, updatedTask.id]);
      }
    }
  }
}
