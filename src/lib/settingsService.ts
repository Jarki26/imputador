import { initDB, type Project, type Company } from './db';

export interface SettingsBackup {
  version: number;
  config: { key: string; value: any }[];
  projects: (Omit<Project, 'lastUsedAt'> & { lastUsedAt: Date | string })[];
  companies: (Omit<Company, 'lastUsedAt'> & { lastUsedAt: Date | string })[];
}

export class SettingsService {
  constructor(private dbName: string = 'imputador-db') {}

  /**
   * Exports all configuration, projects, and companies to a JSON-serializable object.
   */
  async exportData(): Promise<SettingsBackup> {
    const db = await initDB(this.dbName);

    const config = await db.getAll('config');
    const projects = await db.getAll('projects');
    const companies = await db.getAll('companies');

    return {
      version: 1,
      config,
      projects,
      companies,
    };
  }

  /**
   * Imports settings from a backup object, overwriting existing data.
   * @param data The backup data to import.
   */
  async importData(data: SettingsBackup): Promise<void> {
    if (!data || typeof data !== 'object' || !data.config || !data.projects || !data.companies || data.version === undefined) {
      throw new Error('Invalid backup file');
    }

    if (data.version !== 1) {
      throw new Error(`Unsupported backup version: ${data.version}`);
    }

    const db = await initDB(this.dbName);
    const tx = db.transaction(['config', 'projects', 'companies'], 'readwrite');

    // Clear existing data
    await tx.objectStore('config').clear();
    await tx.objectStore('projects').clear();
    await tx.objectStore('companies').clear();

    // Import new data
    for (const item of data.config) {
      await tx.objectStore('config').put(item);
    }

    for (const project of data.projects) {
      // Ensure dates are correctly parsed if they were serialized as strings
      if (typeof project.lastUsedAt === 'string') {
        project.lastUsedAt = new Date(project.lastUsedAt);
      }
      await tx.objectStore('projects').put(project);
    }

    for (const company of data.companies) {
      if (typeof company.lastUsedAt === 'string') {
        company.lastUsedAt = new Date(company.lastUsedAt);
      }
      await tx.objectStore('companies').put(company);
    }

    await tx.done;
  }
}
