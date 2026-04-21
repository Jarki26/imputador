import { initDB, type Task, type RecentTask } from './db';
import { CompanyStore } from './companyStore';
import { applyOverwriteLogic, pushConflict } from './taskStore.collision';
import { addWithSmartFill } from './taskStore.smartFill';
import {
  bulkUpdate,
  revertBulkUpdate,
  setTasksForWeek,
} from './taskStore.bulk';
import {
  getRecentTasks,
  upsertRecentTask,
  purgeHistory,
} from './taskStore.recent';

/**
 * Service for managing tasks in IndexedDB.
 */
export class TaskStore {
  private dbName: string;
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private companyStore: CompanyStore;

  constructor(dbName: string = 'imputador-db') {
    this.dbName = dbName;
    this.companyStore = new CompanyStore(dbName);
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
   * Retrieves all tasks within a specific date range.
   * @param start - Start date of the range.
   * @param end - End date of the range.
   * @returns A promise that resolves to an array of tasks.
   */
  async getTasksForRange(start: Date, end: Date): Promise<Task[]> {
    const db = await this.getDB();
    const range = IDBKeyRange.bound(start, end);
    return db.getAllFromIndex('tasks', 'date', range);
  }

  /**
   * Updates multiple tasks matching a filter within a date range.
   * @param start - Start of date range.
   * @param end - End of date range.
   * @param filter - Partial task object to match against.
   * @param updates - Partial task object with new values.
   * @returns A promise that resolves to the array of original tasks before updates (for undo).
   */
  async bulkUpdate(
    start: Date,
    end: Date,
    filter: Partial<Task>,
    updates: Partial<Task>,
  ): Promise<Task[]> {
    const db = await this.getDB();
    return bulkUpdate(start, end, filter, updates, db, (task) =>
      this.upsertRecentTask(task),
    );
  }

  /**
   * Reverts a bulk update using the original task states.
   * @param originalTasks - Array of tasks to restore.
   */
  async revertBulkUpdate(originalTasks: Task[]): Promise<void> {
    const db = await this.getDB();
    return revertBulkUpdate(originalTasks, db, (task) =>
      this.upsertRecentTask(task),
    );
  }

  /**
   * Finds the chronologically latest task for a given day.
   */
  async getLatestTaskOfDay(date: Date): Promise<Task | null> {
    const tasks = await this.getTasksForDay(date);
    if (tasks.length === 0) return null;
    // Sort by endTime descending
    return tasks.sort((a, b) => b.endTime.getTime() - a.endTime.getTime())[0];
  }

  /**
   * Finds the task that ends closest to but before the end of the given hour on the same day.
   * This is used when clicking a slot in the weekly view to suggest a start time.
   */
  async getClosestPrecedingTask(date: Date): Promise<Task | null> {
    const referenceTime = new Date(date);
    // Use the end of the hour as reference to include tasks that are within this slot
    referenceTime.setHours(date.getHours() + 1, 0, 0, 0);
    return this.getPreviousTask(date, referenceTime);
  }

  /**
   * Finds the task that ends closest to but before the referenceTime on the same day.
   * @param date - The day to search in.
   * @param referenceTime - The time to look before.
   * @param excludeId - Optional ID to exclude from search.
   */
  async getPreviousTask(
    date: Date,
    referenceTime: Date,
    excludeId?: number,
  ): Promise<Task | null> {
    const tasks = await this.getTasksForDay(date);
    if (tasks.length === 0) return null;

    const targetTime = referenceTime.getTime();
    const precedingTasks = tasks
      .filter(
        (t) =>
          t.endTime.getTime() <= targetTime &&
          (excludeId === undefined || t.id !== excludeId),
      )
      .sort((a, b) => b.endTime.getTime() - a.endTime.getTime());

    return precedingTasks.length > 0 ? precedingTasks[0] : null;
  }

  /**
   * Finds the task that starts closest to but after the referenceTime on the same day.
   * @param date - The day to search in.
   * @param referenceTime - The time to look after.
   * @param excludeId - Optional ID to exclude from search.
   */
  async getNextTask(
    date: Date,
    referenceTime: Date,
    excludeId?: number,
  ): Promise<Task | null> {
    const tasks = await this.getTasksForDay(date);
    if (tasks.length === 0) return null;

    const targetTime = referenceTime.getTime();
    const succeedingTasks = tasks
      .filter(
        (t) =>
          t.startTime.getTime() >= targetTime &&
          (excludeId === undefined || t.id !== excludeId),
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return succeedingTasks.length > 0 ? succeedingTasks[0] : null;
  }

  /**
   * Finds the end time of the task that ends closest to but before the referenceTime on the same day.
   */
  async getPreviousTaskEndTime(
    date: Date,
    referenceTime: Date,
    excludeId?: number,
  ): Promise<Date | null> {
    const task = await this.getPreviousTask(date, referenceTime, excludeId);
    return task ? task.endTime : null;
  }

  /**
   * Finds the start time of the task that starts closest to but after the referenceTime on the same day.
   */
  async getNextTaskStartTime(
    date: Date,
    referenceTime: Date,
    excludeId?: number,
  ): Promise<Date | null> {
    const task = await this.getNextTask(date, referenceTime, excludeId);
    return task ? task.startTime : null;
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
    if (updates.title || updates.project || updates.company) {
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

    await applyOverwriteLogic(newTask, store);

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
    await applyOverwriteLogic(updatedTask, store, id);

    await store.put(updatedTask);
    await tx.done;

    if (updates.title || updates.project || updates.company) {
      await this.upsertRecentTask(updatedTask);
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

    await pushConflict(
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
  async updateWithDisplacement(
    id: number,
    updates: Partial<Task>,
  ): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    const existing = await store.get(id);
    if (!existing) throw new Error(`Task ${id} not found`);

    const updatedTask = { ...existing, ...updates };

    await pushConflict(
      updatedTask.startTime.getTime(),
      updatedTask.endTime.getTime(),
      store,
      [id], // Exclude the task being updated
    );

    await store.put(updatedTask);
    await tx.done;

    if (updates.title || updates.project || updates.company) {
      await this.upsertRecentTask(updatedTask);
    }
  }

  /**
   * Retrieves the last 10 unique used tasks.
   */
  async getRecentTasks(): Promise<RecentTask[]> {
    const db = await this.getDB();
    return getRecentTasks(db);
  }

  /**
   * Upserts a task into the recent tasks store.
   */
  async upsertRecentTask(task: Task): Promise<void> {
    const db = await this.getDB();
    return upsertRecentTask(task, db, this.companyStore);
  }

  /**
   * Deletes recent tasks that haven't been used in the last 14 days.
   */
  async purgeHistory(): Promise<void> {
    const db = await this.getDB();
    return purgeHistory(db);
  }

  /**
   * Replaces all tasks for a specific week with a new set of tasks.
   * Useful for Undo/Redo restoration.
   */
  async setTasksForWeek(date: Date, newTasks: Task[]): Promise<void> {
    const db = await this.getDB();
    return setTasksForWeek(date, newTasks, db);
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
    await addWithSmartFill(
      taskData,
      startDate,
      totalDurationMs,
      (date) => this.getTasksForDay(date),
      (task) => this.addTask(task),
    );
  }
}
