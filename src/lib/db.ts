import { openDB, type IDBPDatabase } from 'idb';

/**
 * Interface for a work task.
 */
export interface Task {
  id?: number;
  title: string;
  description: string;
  project: string;
  company?: string;
  type: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Interface for a company.
 */
export interface Company {
  id?: number;
  name: string;
  lastUsedAt: Date;
  useCount: number;
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
 * Interface for a recent task suggestion.
 */
export interface RecentTask {
  title: string;
  description: string;
  project: string;
  company?: string;
  type: string;
  lastUsedAt: Date;
  isBillable: boolean;
}

/**
 * Initializes the IndexedDB database.
 * @param dbName - The name of the database.
 * @returns A promise that resolves to the database instance.
 */
export async function initDB(
  dbName: string = 'imputador-db',
): Promise<IDBPDatabase> {
  return openDB(dbName, 4, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
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
      }
      if (oldVersion < 2) {
        // Create recent tasks store with a composite key on title and project
        const recentStore = db.createObjectStore('recent_tasks', {
          keyPath: ['title', 'project'],
        });
        recentStore.createIndex('lastUsedAt', 'lastUsedAt');
      }
      if (oldVersion < 3) {
        // Create config store
        db.createObjectStore('config', { keyPath: 'key' });
      }
      if (oldVersion < 4) {
        // Create companies store
        const companyStore = db.createObjectStore('companies', {
          keyPath: 'name',
        });
        companyStore.createIndex('useCount', 'useCount');
        companyStore.createIndex('lastUsedAt', 'lastUsedAt');
      }
    },
  });
}
