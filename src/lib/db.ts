import { openDB, type IDBPDatabase } from 'idb';

/**
 * Interface for a work task.
 */
export interface Task {
  id?: number;
  title: string;
  description: string;
  project: string;
  type: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Interface for a project.
 */
export interface Project {
  id?: number;
  name: string;
  lastUsedAt: Date;
}

/**
 * Initializes the IndexedDB database.
 * @param dbName - The name of the database.
 * @returns A promise that resolves to the database instance.
 */
export async function initDB(
  dbName: string = 'imputador-db',
): Promise<IDBPDatabase> {
  return openDB(dbName, 1, {
    upgrade(db) {
      // Create tasks store with an index on date (start time)
      const taskStore = db.createObjectStore('tasks', {
        keyPath: 'id',
        autoIncrement: true,
      });
      taskStore.createIndex('date', 'startTime');

      // Create projects store
      const projectStore = db.createObjectStore('projects', {
        keyPath: 'name',
      });
      projectStore.createIndex('lastUsedAt', 'lastUsedAt');
    },
  });
}
