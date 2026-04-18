import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('TaskStore Bulk Operations', () => {
  let store: TaskStore;

  beforeEach(async () => {
    const dbName = `test-bulk-db-${Math.random().toString(36).substring(7)}`;
    store = new TaskStore(dbName);
  });

  it('should rename a project for all tasks in a date range', async () => {
    const startDate = new Date('2026-04-01T00:00:00Z');
    const endDate = new Date('2026-04-30T23:59:59Z');

    const task1: Task = {
      title: 'Task 1',
      project: 'Old Project',
      startTime: new Date('2026-04-05T10:00:00Z'),
      endTime: new Date('2026-04-05T11:00:00Z'),
      description: '',
      type: '',
    };
    const task2: Task = {
      title: 'Task 2',
      project: 'Old Project',
      startTime: new Date('2026-04-10T10:00:00Z'),
      endTime: new Date('2026-04-10T11:00:00Z'),
      description: '',
      type: '',
    };
    const task3: Task = {
      title: 'Task 3',
      project: 'Other Project',
      startTime: new Date('2026-04-10T12:00:00Z'),
      endTime: new Date('2026-04-10T13:00:00Z'),
      description: '',
      type: '',
    };
    const task4: Task = {
      title: 'Task 4',
      project: 'Old Project',
      startTime: new Date('2026-05-01T10:00:00Z'), // Outside range
      endTime: new Date('2026-05-01T11:00:00Z'),
      description: '',
      type: '',
    };

    await store.addTask(task1);
    await store.addTask(task2);
    await store.addTask(task3);
    await store.addTask(task4);

    await (store as any).bulkUpdate(
      startDate,
      endDate,
      { project: 'Old Project' },
      { project: 'New Project' },
    );

    const tasksInRange = await store.getTasksForRange(startDate, endDate);
    const updatedTasks = tasksInRange.filter(
      (t) => t.project === 'New Project',
    );
    const unchangedTasks = tasksInRange.filter(
      (t) => t.project === 'Old Project',
    );

    expect(updatedTasks).toHaveLength(2);
    expect(unchangedTasks).toHaveLength(0);
    expect(tasksInRange.find((t) => t.title === 'Task 3')?.project).toBe(
      'Other Project',
    );

    const taskOutside = await store.getTasksForRange(
      new Date('2026-05-01T00:00:00Z'),
      new Date('2026-05-01T23:59:59Z'),
    );
    expect(taskOutside[0].project).toBe('Old Project');
  });

  it('should update specific fields for matching identical tasks', async () => {
    const startDate = new Date('2026-04-01T00:00:00Z');
    const endDate = new Date('2026-04-30T23:59:59Z');

    const template = {
      title: 'Meetings',
      project: 'Internal',
      company: 'MyCorp',
      type: 'Meeting',
    };

    const task1: Task = {
      ...template,
      startTime: new Date('2026-04-05T10:00:00Z'),
      endTime: new Date('2026-04-05T11:00:00Z'),
      description: '',
    };
    const task2: Task = {
      ...template,
      startTime: new Date('2026-04-10T10:00:00Z'),
      endTime: new Date('2026-04-10T11:00:00Z'),
      description: '',
    };
    const task3: Task = {
      ...template,
      title: 'Other',
      startTime: new Date('2026-04-10T12:00:00Z'),
      endTime: new Date('2026-04-10T13:00:00Z'),
      description: '',
    };

    await store.addTask(task1);
    await store.addTask(task2);
    await store.addTask(task3);

    await (store as any).bulkUpdate(startDate, endDate, template, {
      title: 'Sync',
      type: 'Call',
    });

    const tasksInRange = await store.getTasksForRange(startDate, endDate);
    const updatedTasks = tasksInRange.filter(
      (t) => t.title === 'Sync' && t.type === 'Call',
    );

    expect(updatedTasks).toHaveLength(2);
    expect(tasksInRange.find((t) => t.title === 'Other')?.type).toBe('Meeting');
  });

  it('should return original tasks for undo support', async () => {
    const startDate = new Date('2026-04-01T00:00:00Z');
    const endDate = new Date('2026-04-30T23:59:59Z');

    const task1: Task = {
      title: 'Task 1',
      project: 'A',
      startTime: new Date('2026-04-05T10:00:00Z'),
      endTime: new Date('2026-04-05T11:00:00Z'),
      description: 'Desc 1',
      type: 'Type 1',
    };

    await store.addTask(task1);

    const result = await (store as any).bulkUpdate(
      startDate,
      endDate,
      { project: 'A' },
      { project: 'B' },
    );

    expect(result).toHaveLength(1);
    expect(result[0].project).toBe('A');
    expect(result[0].id).toBeDefined();
  });

  it('should revert a bulk update', async () => {
    const startDate = new Date('2026-04-01T00:00:00Z');
    const endDate = new Date('2026-04-30T23:59:59Z');

    const task1: Task = {
      title: 'Original Title',
      project: 'Original Project',
      startTime: new Date('2026-04-05T10:00:00Z'),
      endTime: new Date('2026-04-05T11:00:00Z'),
      description: '',
      type: '',
    };

    await store.addTask(task1);

    const originals = await (store as any).bulkUpdate(
      startDate,
      endDate,
      { project: 'Original Project' },
      { project: 'Updated Project' },
    );

    const updatedTasks = await store.getTasksForRange(startDate, endDate);
    expect(updatedTasks[0].project).toBe('Updated Project');

    await (store as any).revertBulkUpdate(originals);

    const revertedTasks = await store.getTasksForRange(startDate, endDate);
    expect(revertedTasks[0].project).toBe('Original Project');
  });
});
