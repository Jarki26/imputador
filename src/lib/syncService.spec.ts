import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncService } from './syncService';
import { initDB } from './db';

describe('syncService', () => {
  const dbName = 'sync-test-db';

  beforeEach(async () => {
    const db = await initDB(dbName);
    await db.clear('tasks');
    await db.clear('projects');
    await db.clear('companies');
    await db.clear('config');
  });

  it('should generate a full sync payload', async () => {
    const db = await initDB(dbName);

    // Add some dummy data
    await db.add('tasks', {
      title: 'Test Task',
      startTime: new Date(),
      endTime: new Date(),
      project: 'P1',
      type: 'Work',
      description: '',
    });
    await db.add('projects', { name: 'P1', lastUsedAt: new Date() });
    await db.add('companies', { name: 'C1', lastUsedAt: new Date() });
    await db.add('config', { key: 'k1', value: 'v1' });

    const payload = await syncService.generatePayload(dbName);

    expect(payload.tasks.length).toBe(1);
    expect(payload.projects.length).toBe(1);
    expect(payload.companies.length).toBe(1);
    expect(payload.config.length).toBe(1);
    expect(payload.timestamp).toBeDefined();
  });

  it('should apply a sync payload (overwrite)', async () => {
    const db = await initDB(dbName);

    const payload = {
      tasks: [
        {
          id: 1,
          title: 'Remote Task',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          project: 'RP',
          type: 'Work',
          description: '',
        },
      ],
      projects: [{ id: 1, name: 'RP', lastUsedAt: new Date().toISOString() }],
      companies: [{ id: 1, name: 'RC', lastUsedAt: new Date().toISOString() }],
      config: [{ key: 'rk', value: 'rv' }],
      timestamp: Date.now(),
    };

    await syncService.applyPayload(payload as any, dbName);

    const tasks = await db.getAll('tasks');
    const projects = await db.getAll('projects');
    const companies = await db.getAll('companies');
    const config = await db.getAll('config');

    expect(tasks[0].title).toBe('Remote Task');
    expect(projects[0].name).toBe('RP');
    expect(companies[0].name).toBe('RC');
    expect(config[0].value).toBe('rv');
  });

  it('should apply a sync payload (with Date objects)', async () => {
    const db = await initDB(dbName);

    const payload = {
      tasks: [
        {
          id: 1,
          title: 'Remote Task',
          startTime: new Date(),
          endTime: new Date(),
          project: 'RP',
          type: 'Work',
          description: '',
        },
      ],
      projects: [{ id: 1, name: 'RP', lastUsedAt: new Date() }],
      companies: [{ id: 1, name: 'RC', lastUsedAt: new Date() }],
      config: [{ key: 'rk', value: 'rv' }],
      timestamp: Date.now(),
    };

    await syncService.applyPayload(payload as any, dbName);

    const tasks = await db.getAll('tasks');
    expect(tasks[0].title).toBe('Remote Task');
    expect(tasks[0].startTime).toBeInstanceOf(Date);
  });
});
