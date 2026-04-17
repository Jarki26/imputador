import { type Task, type RecentTask } from './db';
import { isBillable } from './config';
import type { CompanyStore } from './companyStore';

/**
 * Retrieves the last 10 unique used tasks.
 */
export async function getRecentTasks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
): Promise<RecentTask[]> {
  const recents = await db.getAllFromIndex('recent_tasks', 'lastUsedAt');
  // Index gives ascending order, we want most recent first
  return recents.reverse().slice(0, 10);
}

/**
 * Upserts a task into the recent tasks store.
 */
export async function upsertRecentTask(
  task: Task,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  companyStore: CompanyStore,
): Promise<void> {
  const recent: RecentTask = {
    title: task.title,
    description: task.description,
    project: task.project,
    company: task.company,
    type: task.type,
    lastUsedAt: new Date(),
    isBillable: isBillable(task.type),
  };
  await db.put('recent_tasks', recent);

  if (task.company) {
    await companyStore.upsertCompany(task.company);
  }
}

/**
 * Deletes recent tasks that haven't been used in the last 14 days.
 */
export async function purgeHistory(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
): Promise<void> {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const tx = db.transaction('recent_tasks', 'readwrite');
  const index = tx.store.index('lastUsedAt');
  const range = IDBKeyRange.upperBound(twoWeeksAgo);

  let cursor = await index.openCursor(range);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}
