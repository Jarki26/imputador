import type { Task } from './db';

/**
 * Updates multiple tasks matching a filter within a date range.
 */
export async function bulkUpdate(
  start: Date,
  end: Date,
  filter: Partial<Task>,
  updates: Partial<Task>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertRecentTask: (task: Task) => Promise<void>,
): Promise<Task[]> {
  const range = IDBKeyRange.bound(start, end);
  const tx = db.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');
  const index = store.index('date');

  const matchingTasks: Task[] = [];
  const originalTasks: Task[] = [];

  let cursor = await index.openCursor(range);
  while (cursor) {
    const task = cursor.value;
    let matches = true;

    for (const [key, value] of Object.entries(filter)) {
      if (task[key as keyof Task] !== value) {
        matches = false;
        break;
      }
    }

    if (matches) {
      originalTasks.push({ ...task });
      const updatedTask = { ...task, ...updates };
      await cursor.update(updatedTask);
      matchingTasks.push(updatedTask);
    }
    cursor = await cursor.continue();
  }

  await tx.done;

  // Update history for all matching tasks if project/company/title changed
  if (updates.project || updates.company || updates.title) {
    for (const task of matchingTasks) {
      await upsertRecentTask(task);
    }
  }

  return originalTasks;
}

/**
 * Reverts a bulk update using the original task states.
 */
export async function revertBulkUpdate(
  originalTasks: Task[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertRecentTask: (task: Task) => Promise<void>,
): Promise<void> {
  const tx = db.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');

  for (const task of originalTasks) {
    await store.put(task);
  }

  await tx.done;

  // Update history for all reverted tasks
  for (const task of originalTasks) {
    await upsertRecentTask(task);
  }
}

/**
 * Replaces all tasks for a specific week with a new set of tasks.
 */
export async function setTasksForWeek(
  date: Date,
  newTasks: Task[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
): Promise<void> {
  const tx = db.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');
  const index = store.index('date');

  // Find Monday of the current week
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(current.setDate(diff));

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const range = IDBKeyRange.bound(startOfWeek, endOfWeek);
  const existingTasks: Task[] = await index.getAll(range);

  // Delete existing
  for (const task of existingTasks) {
    if (task.id) await store.delete(task.id);
  }

  // Add new (without IDs to avoid collisions, or with IDs if we want to preserve them)
  for (const task of newTasks) {
    const taskToSave = { ...task };
    delete taskToSave.id; // Let DB generate new IDs
    await store.add(taskToSave);
  }

  await tx.done;
}
