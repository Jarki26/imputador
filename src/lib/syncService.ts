import { initDB, type Task, type Project, type Company } from './db';

export interface SyncPayload {
  tasks: Task[];
  projects: Project[];
  companies: Company[];
  config: { key: string; value: any; updatedAt?: number }[];
  timestamp: number;
}

export const syncService = {
  async generatePayload(dbName: string = 'imputador-db'): Promise<SyncPayload> {
    const db = await initDB(dbName);

    const tasks = await db.getAll('tasks');

    // Legacy data repair: Ensure all tasks have a UUID and updatedAt
    for (const task of tasks) {
      if (!task.uuid || !task.updatedAt) {
        if (!task.uuid) task.uuid = crypto.randomUUID();
        if (!task.updatedAt) task.updatedAt = Date.now();
        await db.put('tasks', task);
      }
    }

    const projects = await db.getAll('projects');
    for (const project of projects) {
      if (!(project as any).updatedAt) {
        (project as any).updatedAt = Date.now();
        await db.put('projects', project);
      }
    }

    const companies = await db.getAll('companies');
    for (const company of companies) {
      if (!(company as any).updatedAt) {
        (company as any).updatedAt = Date.now();
        await db.put('companies', company);
      }
    }

    const config = await db.getAll('config');
    for (const item of config) {
      if (!(item as any).updatedAt) {
        (item as any).updatedAt = Date.now();
        await db.put('config', item);
      }
    }

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
