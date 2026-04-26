import { initDB, type Task, type Project, type Company } from './db';

export interface SyncPayload {
  tasks: Task[];
  projects: Project[];
  companies: Company[];
  config: { key: string; value: any }[];
  timestamp: number;
}

export const syncService = {
  async generatePayload(dbName: string = 'imputador-db'): Promise<SyncPayload> {
    const db = await initDB(dbName);

    const tasks = await db.getAll('tasks');
    const projects = await db.getAll('projects');
    const companies = await db.getAll('companies');
    const config = await db.getAll('config');

    return {
      tasks,
      projects,
      companies,
      config,
      timestamp: Date.now(),
    };
  },

  async applyPayload(
    payload: SyncPayload,
    dbName: string = 'imputador-db',
  ): Promise<void> {
    const db = await initDB(dbName);
    const tx = db.transaction(
      ['tasks', 'projects', 'companies', 'config'],
      'readwrite',
    );

    // Clear existing data (for full overwrite synchronization)
    await tx.objectStore('tasks').clear();
    await tx.objectStore('projects').clear();
    await tx.objectStore('companies').clear();
    await tx.objectStore('config').clear();

    // Import new data
    for (const task of payload.tasks) {
      if (typeof task.startTime === 'string')
        task.startTime = new Date(task.startTime);
      if (typeof task.endTime === 'string')
        task.endTime = new Date(task.endTime);
      await tx.objectStore('tasks').put(task);
    }

    for (const project of payload.projects) {
      if (typeof project.lastUsedAt === 'string')
        project.lastUsedAt = new Date(project.lastUsedAt);
      await tx.objectStore('projects').put(project);
    }

    for (const company of payload.companies) {
      if (typeof company.lastUsedAt === 'string')
        company.lastUsedAt = new Date(company.lastUsedAt);
      await tx.objectStore('companies').put(company);
    }

    for (const item of payload.config) {
      await tx.objectStore('config').put(item);
    }

    await tx.done;
  },
};
