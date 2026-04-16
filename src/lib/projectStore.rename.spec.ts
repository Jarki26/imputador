import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectStore } from './projectStore';

describe('ProjectStore Rename', () => {
  let store: ProjectStore;

  beforeEach(async () => {
    const dbName = `test-project-rename-db-${Math.random().toString(36).substring(7)}`;
    store = new ProjectStore(dbName);
  });

  it('should rename a project and preserve lastUsedAt', async () => {
    const oldName = 'Old Project';
    const newName = 'New Project';
    
    await store.upsertProject(oldName);
    const initial = await store.searchProjects(oldName);
    const lastUsedAt = initial[0].lastUsedAt;

    await (store as any).renameProject(oldName, newName);

    const oldResults = await store.searchProjects(oldName);
    const newResults = await store.searchProjects(newName);

    expect(oldResults).toHaveLength(0);
    expect(newResults).toHaveLength(1);
    expect(newResults[0].name).toBe(newName);
    expect(newResults[0].lastUsedAt.getTime()).toBe(lastUsedAt.getTime());
  });

  it('should do nothing if old project does not exist', async () => {
    await (store as any).renameProject('Non Existent', 'New');
    const results = await store.searchProjects('New');
    expect(results).toHaveLength(0);
  });
});
