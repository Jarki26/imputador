import {
  initDB,
  type Task,
  type Project,
  type Company,
  putItem,
  addItem,
} from './db';
import type { SyncPayload } from './syncService';

export const syncEngine = {
  async mergePayload(
    payload: SyncPayload,
    dbName: string = 'imputador-db',
  ): Promise<void> {
    const db = await initDB(dbName);

    // Merge Config
    for (const remoteConfig of payload.config) {
      const localConfig = await db.get('config', remoteConfig.key);
      if (
        !localConfig ||
        (remoteConfig as any).updatedAt > (localConfig.updatedAt || 0)
      ) {
        await putItem(db, 'config', remoteConfig, true);
      }
    }

    // Merge Projects
    for (const remoteProject of payload.projects) {
      const localProject = await db.get('projects', remoteProject.name);
      if (
        !localProject ||
        (remoteProject.updatedAt || 0) > (localProject.updatedAt || 0)
      ) {
        await putItem(db, 'projects', remoteProject, true);
      }
    }

    // Merge Companies
    for (const remoteCompany of payload.companies) {
      const localCompany = await db.get('companies', remoteCompany.name);
      if (
        !localCompany ||
        (remoteCompany.updatedAt || 0) > (localCompany.updatedAt || 0)
      ) {
        await putItem(db, 'companies', remoteCompany, true);
      }
    }

    // Merge Tasks
    for (const remoteTask of payload.tasks) {
      // Find local task by UUID
      const localTask = await db.getFromIndex('tasks', 'uuid', remoteTask.uuid);

      if (!localTask) {
        // Insert new task (strip local ID if any)
        const newTask = { ...remoteTask };
        delete newTask.id;

        // Ensure dates are actual Date objects if they came from JSON
        if (typeof newTask.startTime === 'string')
          newTask.startTime = new Date(newTask.startTime);
        if (typeof newTask.endTime === 'string')
          newTask.endTime = new Date(newTask.endTime);

        await addItem(db, 'tasks', newTask, true);
      } else if ((remoteTask.updatedAt || 0) > (localTask.updatedAt || 0)) {
        // Update existing task
        const updatedTask = { ...remoteTask, id: localTask.id };

        if (typeof updatedTask.startTime === 'string')
          updatedTask.startTime = new Date(updatedTask.startTime);
        if (typeof updatedTask.endTime === 'string')
          updatedTask.endTime = new Date(updatedTask.endTime);

        await putItem(db, 'tasks', updatedTask, true);
      }
    }
  },
};
