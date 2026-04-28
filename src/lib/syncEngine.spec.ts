import { describe, it, expect, beforeEach } from 'vitest';
import { syncEngine } from './syncEngine';
import { initDB, addItem, putItem } from './db';

describe('syncEngine', () => {
  const dbName = 'sync-engine-test-db';

  beforeEach(async () => {
    const db = await initDB(dbName);
    await db.clear('tasks');
    await db.clear('config');
  });

  it('should merge remote task if it is newer', async () => {
    const db = await initDB(dbName);
    const uuid = 'test-uuid';

    // Local task (older)
    await addItem(
      db,
      'tasks',
      {
        uuid,
        title: 'Local Task',
        startTime: new Date(),
        endTime: new Date(),
        project: 'P1',
        type: 'Work',
        description: '',
        updatedAt: 1000,
      },
      true,
    );

    const payload = {
      tasks: [
        {
          uuid,
          title: 'Remote Task (Newer)',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          project: 'P1',
          type: 'Work',
          description: '',
          updatedAt: 2000,
        },
      ],
      projects: [],
      companies: [],
      config: [],
      timestamp: Date.now(),
    };

    await syncEngine.mergePayload(payload as any, dbName);

    const tasks = await db.getAll('tasks');
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Remote Task (Newer)');
  });

  it('should keep local task if it is newer', async () => {
    const db = await initDB(dbName);
    const uuid = 'test-uuid';

    // Local task (newer)
    await addItem(
      db,
      'tasks',
      {
        uuid,
        title: 'Local Task (Newer)',
        startTime: new Date(),
        endTime: new Date(),
        project: 'P1',
        type: 'Work',
        description: '',
        updatedAt: 3000,
      },
      true,
    );

    const payload = {
      tasks: [
        {
          uuid,
          title: 'Remote Task (Older)',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          project: 'P1',
          type: 'Work',
          description: '',
          updatedAt: 2000,
        },
      ],
      projects: [],
      companies: [],
      config: [],
      timestamp: Date.now(),
    };

    await syncEngine.mergePayload(payload as any, dbName);

    const tasks = await db.getAll('tasks');
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Local Task (Newer)');
  });

  it('should insert remote task if it does not exist locally', async () => {
    const db = await initDB(dbName);

    const payload = {
      tasks: [
        {
          uuid: 'new-uuid',
          title: 'New Remote Task',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          project: 'P1',
          type: 'Work',
          description: '',
          updatedAt: 2000,
        },
      ],
      projects: [],
      companies: [],
      config: [],
      timestamp: Date.now(),
    };

    await syncEngine.mergePayload(payload as any, dbName);

    const tasks = await db.getAll('tasks');
    expect(tasks.length).toBe(1);
    expect(tasks[0].uuid).toBe('new-uuid');
  });

  it('should merge remote config if it is newer', async () => {
    const db = await initDB(dbName);

    // Local config
    await putItem(
      db,
      'config',
      { key: 'k1', value: 'local', updatedAt: 1000 },
      true,
    );

    const payload = {
      tasks: [],
      projects: [],
      companies: [],
      config: [{ key: 'k1', value: 'remote', updatedAt: 2000 }],
      timestamp: Date.now(),
    };

    await syncEngine.mergePayload(payload as any, dbName);

    const config = await db.get('config', 'k1');
    expect(config.value).toBe('remote');
  });

  it('should merge remote projects and companies', async () => {
    const db = await initDB(dbName);

    const payload = {
      tasks: [],
      projects: [{ name: 'P1', lastUsedAt: new Date(), updatedAt: 2000 }],
      companies: [
        { name: 'C1', lastUsedAt: new Date(), useCount: 1, updatedAt: 2000 },
      ],
      config: [],
      timestamp: Date.now(),
    };

    await syncEngine.mergePayload(payload as any, dbName);

    const projects = await db.getAll('projects');
    const companies = await db.getAll('companies');
    expect(projects.length).toBe(1);
    expect(companies.length).toBe(1);
  });

  it('should keep local config if it is newer', async () => {
    const db = await initDB(dbName);
    await putItem(
      db,
      'config',
      { key: 'k1', value: 'local', updatedAt: 3000 },
      true,
    );

    const payload = {
      tasks: [],
      projects: [],
      companies: [],
      config: [{ key: 'k1', value: 'remote', updatedAt: 2000 }],
      timestamp: Date.now(),
    };

    await syncEngine.mergePayload(payload as any, dbName);

    const config = await db.get('config', 'k1');
    expect(config.value).toBe('local');
  });

  it('should keep local project if it is newer', async () => {
    const db = await initDB(dbName);
    await putItem(
      db,
      'projects',
      { name: 'P1', lastUsedAt: new Date(), updatedAt: 3000 },
      true,
    );

    const payload = {
      tasks: [],
      projects: [{ name: 'P1', lastUsedAt: new Date(), updatedAt: 2000 }],
      companies: [],
      config: [],
      timestamp: Date.now(),
    };

    await syncEngine.mergePayload(payload as any, dbName);

    const project = await db.get('projects', 'P1');
    expect(project.updatedAt).toBe(3000);
  });
});
