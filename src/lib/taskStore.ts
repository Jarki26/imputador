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
}
