import { initDB, type Task, type RecentTask } from './db';
import { isBillable } from './config';

/**
 * Service for managing tasks in IndexedDB.
 */
export class TaskStore {
  private dbName: string;
  private dbPromise: Promise<IDBPDatabase> | null = null;

  constructor(dbName: string = 'imputador-db') {
    this.dbName = dbName;
  }

  private getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = initDB(this.dbName);
    }
    return this.dbPromise;
  }

  /**
   * Adds a new task to the store.
   * @param task - The task to add.
   * @returns A promise that resolves to the auto-generated ID.
   */
  async addTask(task: Task): Promise<number | undefined> {
    const db = await this.getDB();
    const id = await db.add('tasks', task);
    await this.upsertRecentTask(task);
    await this.purgeHistory();
    return id as number;
  }

  /**
   * Retrieves all tasks for a specific day.
   * @param date - The date to retrieve tasks for.
   * @returns A promise that resolves to an array of tasks.
   */
  async getTasksForDay(date: Date): Promise<Task[]> {
    const db = await this.getDB();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const range = IDBKeyRange.bound(startOfDay, endOfDay);
    return db.getAllFromIndex('tasks', 'date', range);
  }

  /**
   * Retrieves all tasks for a specific week.
   * @param date - Any date within the week to retrieve.
   * @returns A promise that resolves to an array of tasks.
   */
  async getTasksForWeek(date: Date): Promise<Task[]> {
    const db = await this.getDB();

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
    return db.getAllFromIndex('tasks', 'date', range);
  }

  /**
   * Updates an existing task.
   * @param id - The ID of the task to update.
   * @param updates - Partial task object containing updates.
   */
  async updateTask(id: number, updates: Partial<Task>): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    const task = await store.get(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const updatedTask = { ...task, ...updates };
    await store.put(updatedTask);
    await tx.done;

    // Also update recents if title or project changed
    if (updates.title || updates.project) {
      await this.upsertRecentTask(updatedTask);
    }
  }

  /**
   * Deletes a task by ID.
   * @param id - The ID of the task to delete.
   */
  async deleteTask(id: number): Promise<void> {
    const db = await this.getDB();
    await db.delete('tasks', id);
  }

  /**
   * Adds a new task, overwriting (splitting or deleting) any existing tasks that collide.
   * @param newTask - The new task to add.
   */
  async addWithOverwrite(newTask: Task): Promise<number | undefined> {
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    await this.applyOverwriteLogic(newTask, store);

    const id = await store.add(newTask);
    await tx.done;

    await this.upsertRecentTask(newTask);
    await this.purgeHistory();
    return id as number;
  }

  /**
   * Updates an existing task with overwrite strategy.
   */
  async updateWithOverwrite(id: number, updates: Partial<Task>): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    const existing = await store.get(id);
    if (!existing) throw new Error(`Task ${id} not found`);

    const updatedTask = { ...existing, ...updates };
    await this.applyOverwriteLogic(updatedTask, store, id);

    await store.put(updatedTask);
    await tx.done;

    if (updates.title || updates.project) {
      await this.upsertRecentTask(updatedTask);
    }
  }

  private async applyOverwriteLogic(
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
   * Adds a new task, shifting any existing tasks that collide forward in time.
   * @param newTask - The new task to add.
   */
  async addWithDisplacement(newTask: Task): Promise<number | undefined> {
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    await this.pushConflict(
      newTask.startTime.getTime(),
      newTask.endTime.getTime(),
      store,
    );

    const id = await store.add(newTask);
    await tx.done;

    await this.upsertRecentTask(newTask);
    await this.purgeHistory();
    return id as number;
  }

  /**
   * Updates an existing task with displacement strategy.
   */
  async updateWithDisplacement(id: number, updates: Partial<Task>): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    const existing = await store.get(id);
    if (!existing) throw new Error(`Task ${id} not found`);

    const updatedTask = { ...existing, ...updates };

    await this.pushConflict(
      updatedTask.startTime.getTime(),
      updatedTask.endTime.getTime(),
      store,
      id, // Exclude the task being updated
    );

    await store.put(updatedTask);
    await tx.done;

    if (updates.title || updates.project) {
      await this.upsertRecentTask(updatedTask);
    }
  }

  /**
   * Retrieves the last 10 unique used tasks.
   */
  async getRecentTasks(): Promise<RecentTask[]> {
    const db = await this.getDB();
    const recents = await db.getAllFromIndex('recent_tasks', 'lastUsedAt');
    // Index gives ascending order, we want most recent first
    return recents.reverse().slice(0, 10);
  }

  /**
   * Upserts a task into the recent tasks store.
   */
  async upsertRecentTask(task: Task): Promise<void> {
    const db = await this.getDB();
    const recent: RecentTask = {
      title: task.title,
      description: task.description,
      project: task.project,
      type: task.type,
      lastUsedAt: new Date(),
      isBillable: isBillable(task.type),
    };
    await db.put('recent_tasks', recent);
  }

  /**
   * Deletes recent tasks that haven't been used in the last 14 days.
   */
  async purgeHistory(): Promise<void> {
    const db = await this.getDB();
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
  /**
   * Recursively shifts tasks that overlap with the given range.
   */
  private async pushConflict(
    start: number,
    end: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store: any,
    excludeId?: number,
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
      if (!oldTask.id || oldTask.id === excludeId) continue;

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
          await this.pushConflict(newStart, newEnd, store);
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
          // excludeId is important here to not push 'updatedTask' again
          await this.pushConflict(newStart, newEnd, store, updatedTask.id);
        }
      }
    }
  }
  /**
   * Replaces all tasks for a specific week with a new set of tasks.
   * Useful for Undo/Redo restoration.
   */
  async setTasksForWeek(date: Date, newTasks: Task[]): Promise<void> {
    const db = await this.getDB();
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
      delete taskToSave.id; // Let DB generate new IDs or we can keep them if we use put
      await store.add(taskToSave);
    }

    await tx.done;
  }

  /**
   * Automatically distributes a total duration across available empty slots starting from a given date.
   * @param taskData - Base task information (title, project, etc.).
   * @param startDate - The date to start filling from (starts at 00:00).
   * @param totalDurationMs - The total duration to distribute in milliseconds.
   */
  async addWithSmartFill(
    taskData: Omit<Task, 'startTime' | 'endTime'>,
    startDate: Date,
    totalDurationMs: number,
  ): Promise<void> {
    let remaining = totalDurationMs;
    const current = new Date(startDate);
    // Keep the time if it's the first day, but for subsequent days we'll start at 00:00
    let isFirstDay = true;

    while (remaining > 0) {
      const dayTasks = (await this.getTasksForDay(current)).sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime(),
      );

      const gaps: { start: Date; end: Date }[] = [];
      let lastEnd = new Date(current);
      if (isFirstDay) {
        // lastEnd is already startDate (including time)
      } else {
        lastEnd.setHours(0, 0, 0, 0);
      }

      for (const task of dayTasks) {
        // Skip tasks that end before our starting point
        if (task.endTime <= lastEnd) continue;

        const effectiveStart =
          task.startTime < lastEnd ? lastEnd : task.startTime;

        if (effectiveStart > lastEnd) {
          gaps.push({
            start: new Date(lastEnd),
            end: new Date(effectiveStart),
          });
        }
        if (task.endTime > lastEnd) {
          lastEnd = new Date(task.endTime);
        }
      }

      const dayEnd = new Date(current);
      dayEnd.setHours(24, 0, 0, 0);
      if (lastEnd < dayEnd) {
        gaps.push({ start: new Date(lastEnd), end: dayEnd });
      }

      for (const gap of gaps) {
        const gapDuration = gap.end.getTime() - gap.start.getTime();
        const fillDuration = Math.min(gapDuration, remaining);

        if (fillDuration > 0) {
          await this.addTask({
            ...taskData,
            startTime: new Date(gap.start),
            endTime: new Date(gap.start.getTime() + fillDuration),
          } as Task);
          remaining -= fillDuration;
        }

        if (remaining <= 0) break;
      }

      if (remaining > 0) {
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
        isFirstDay = false;
        // Safety break to prevent infinite loops (e.g., if we go too far in the future)
        if (current.getFullYear() > startDate.getFullYear() + 1) break;
      }
    }
  }
}
