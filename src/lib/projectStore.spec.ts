import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectStore } from './projectStore';

describe('ProjectStore operations', () => {
  let store: ProjectStore;

  beforeEach(async () => {
    // Clear databases before each test
    const dbs = await window.indexedDB.databases();
    dbs.forEach((db) => {
      if (db.name) window.indexedDB.deleteDatabase(db.name);
    });
    store = new ProjectStore('test-project-db');
  });

  it('should add a project and retrieve it', async () => {
    await store.upsertProject('Project A');
    const projects = await store.searchProjects('Pro');
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe('Project A');
  });

  it('should update lastUsedAt when upserting existing project', async () => {
    await store.upsertProject('Project A');
    const p1 = (await store.searchProjects('Project A'))[0];

    // Wait a bit to ensure timestamp changes
    await new Promise((resolve) => setTimeout(resolve, 10));

    await store.upsertProject('Project A');
    const p2 = (await store.searchProjects('Project A'))[0];

    expect(p2.lastUsedAt.getTime()).toBeGreaterThan(p1.lastUsedAt.getTime());
  });

  it('should return recent projects', async () => {
    await store.upsertProject('Old Project');
    await new Promise((resolve) => setTimeout(resolve, 10));
    await store.upsertProject('New Project');

    const recent = await store.getRecentProjects(5);
    expect(recent[0].name).toBe('New Project');
    expect(recent[1].name).toBe('Old Project');
  });
});
