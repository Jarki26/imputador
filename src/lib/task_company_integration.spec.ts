import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import { CompanyStore } from './companyStore';
import type { Task } from './db';

describe('Task and Company Integration', () => {
  let taskStore: TaskStore;
  let companyStore: CompanyStore;
  let dbName: string;

  beforeEach(async () => {
    dbName = `test-integration-db-${Math.random().toString(36).substring(7)}`;
    taskStore = new TaskStore(dbName);
    companyStore = new CompanyStore(dbName);
  });

  it('should automatically upsert company when adding a task with company', async () => {
    const task: Task = {
      title: 'Task with Company',
      description: 'Desc',
      project: 'Project X',
      company: 'Integration Co',
      type: 'Feature',
      startTime: new Date('2026-04-14T10:00:00Z'),
      endTime: new Date('2026-04-14T11:00:00Z'),
    };

    await taskStore.addTask(task);

    const companies = await companyStore.getRecentCompanies(10);
    expect(companies).toHaveLength(1);
    expect(companies[0].name).toBe('Integration Co');
    expect(companies[0].useCount).toBe(1);
  });

  it('should increment company useCount when multiple tasks are added with same company', async () => {
    const task1: Task = {
      title: 'Task 1',
      description: 'Desc',
      project: 'Project X',
      company: 'Multi Co',
      type: 'Feature',
      startTime: new Date('2026-04-14T10:00:00Z'),
      endTime: new Date('2026-04-14T11:00:00Z'),
    };

    const task2: Task = {
      title: 'Task 2',
      description: 'Desc',
      project: 'Project Y',
      company: 'Multi Co',
      type: 'Bug',
      startTime: new Date('2026-04-14T11:00:00Z'),
      endTime: new Date('2026-04-14T12:00:00Z'),
    };

    await taskStore.addTask(task1);
    await taskStore.addTask(task2);

    const companies = await companyStore.getRecentCompanies(10);
    expect(companies).toHaveLength(1);
    expect(companies[0].name).toBe('Multi Co');
    expect(companies[0].useCount).toBe(2);
  });
});
