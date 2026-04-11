import { initDB, type Task } from './db';

/**
 * Service for managing tasks in IndexedDB.
 */
export class TaskStore {
  private dbName: string;

  constructor(dbName: string = 'imputador-db') {
    this.dbName = dbName;
  }

  /**
   * Adds a new task to the store.
   * @param task - The task to add.
   * @returns A promise that resolves to the auto-generated ID.
   */
  async addTask(task: Task): Promise<number | undefined> {
    const db = await initDB(this.dbName);
    const id = await db.add('tasks', task);
    return id as number;
  }

  /**
   * Retrieves all tasks for a specific day.
   * @param date - The date to retrieve tasks for.
   * @returns A promise that resolves to an array of tasks.
   */
  async getTasksForDay(date: Date): Promise<Task[]> {
    const db = await initDB(this.dbName);
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
    const db = await initDB(this.dbName);

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
    const db = await initDB(this.dbName);
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    const task = await store.get(id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const updatedTask = { ...task, ...updates };
    await store.put(updatedTask);
    await tx.done;
  }

  /**
   * Deletes a task by ID.
   * @param id - The ID of the task to delete.
   */
  async deleteTask(id: number): Promise<void> {
    const db = await initDB(this.dbName);
    await db.delete('tasks', id);
  }

  /**
   * Adds a new task, overwriting (splitting or deleting) any existing tasks that collide.
   * @param newTask - The new task to add.
   */
  async addWithOverwrite(newTask: Task): Promise<number | undefined> {
    const db = await initDB(this.dbName);
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
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
      if (!task.id) continue;

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

    const id = await store.add(newTask);
    await tx.done;
    return id as number;
  }
}
