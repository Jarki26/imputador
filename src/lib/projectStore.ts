import { initDB, type Project, putItem, deleteItem, getMany } from './db';

/**
 * Service for managing projects in IndexedDB.
 */
export class ProjectStore {
  private dbName: string;

  constructor(dbName: string = 'imputador-db') {
    this.dbName = dbName;
  }

  /**
   * Adds or updates a project, setting its lastUsedAt timestamp to now.
   * @param name - The name of the project.
   */
  async upsertProject(name: string): Promise<void> {
    const db = await initDB(this.dbName);
    const project: Project = {
      name,
      lastUsedAt: new Date(),
    };
    await putItem(db, 'projects', project);
  }

  /**
   * Renames a project in the store, preserving its lastUsedAt timestamp.
   * @param oldName - Current name of the project.
   * @param newName - New name for the project.
   */
  async renameProject(oldName: string, newName: string): Promise<void> {
    const db = await initDB(this.dbName);
    const existing = await db.get('projects', oldName);
    if (!existing) return;

    await deleteItem(db, 'projects', oldName);
    await putItem(db, 'projects', {
      ...existing,
      name: newName,
    });
  }

  /**
   * Searches for projects by name (case-insensitive prefix match).
   * @param query - The search query.
   * @returns A promise that resolves to an array of matching projects.
   */
  async searchProjects(query: string): Promise<Project[]> {
    const db = await initDB(this.dbName);
    const projects = await getMany<Project>(db, 'projects');
    const lowerQuery = query.toLowerCase();

    return projects
      .filter((p) => p.name.toLowerCase().startsWith(lowerQuery))
      .sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime());
  }

  /**
   * Retrieves the most recently used projects.
   * @param limit - The maximum number of projects to return.
   * @returns A promise that resolves to an array of recent projects.
   */
  async getRecentProjects(limit: number = 10): Promise<Project[]> {
    const db = await initDB(this.dbName);
    return getMany<Project>(db, 'projects', {
        indexName: 'lastUsedAt',
        direction: 'prev',
        limit
    });
  }
}

