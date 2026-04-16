import { initDB, type Project } from './db';

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
    await db.put('projects', project);
  }

  /**
   * Renames a project in the store, preserving its lastUsedAt timestamp.
   * @param oldName - Current name of the project.
   * @param newName - New name for the project.
   */
  async renameProject(oldName: string, newName: string): Promise<void> {
    const db = await initDB(this.dbName);
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');

    const project = await store.get(oldName);
    if (!project) return;

    await store.delete(oldName);
    await store.put({
      ...project,
      name: newName,
    });
    await tx.done;
  }

  /**
   * Searches for projects by name (case-insensitive prefix match).
   * @param query - The search query.
   * @returns A promise that resolves to an array of matching projects.
   */
  async searchProjects(query: string): Promise<Project[]> {
    const db = await initDB(this.dbName);
    const tx = db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');

    // We can't do case-insensitive search efficiently in IDB without a specialized index
    // or scanning. For now, we'll get all and filter, assuming project count is small (<1000).
    const projects = await store.getAll();
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
    const tx = db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    const index = store.index('lastUsedAt');

    // Get projects sorted by lastUsedAt descending
    const projects: Project[] = [];
    let cursor = await index.openCursor(null, 'prev');

    while (cursor && projects.length < limit) {
      projects.push(cursor.value);
      cursor = await cursor.continue();
    }

    return projects;
  }
}
