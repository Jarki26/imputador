import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import { initDB, type Task } from './db';

describe('TaskStore Recent Tasks and Purger', { timeout: 30000 }, () => {
  let store: TaskStore;
  let currentDbName: string;

  beforeEach(async () => {
    currentDbName = `test-recent-tasks-${Math.random().toString(36).substring(7)}`;
    store = new TaskStore(currentDbName);
  });

  it('should store and retrieve recent tasks', async () => {
    const task1: Task = {
      title: 'Task A',
      description: 'Desc A',
      project: 'Project 1',
      type: 'Feature',
      startTime: new Date('2026-04-11T09:00:00Z'),
      endTime: new Date('2026-04-11T10:00:00Z'),
    };

    await store.addTask(task1);

    const recents = await store.getRecentTasks();
    expect(recents).toHaveLength(1);
    expect(recents[0].title).toBe('Task A');
    expect(recents[0].type).toBe('Feature');
    expect(recents[0].isBillable).toBe(true);
  });

  it('should limit recent tasks to 10 unique entries', async () => {
    for (let i = 1; i <= 12; i++) {
      const task: Task = {
        title: `Task ${i}`,
        description: `Desc ${i}`,
        project: 'Project 1',
        type: 'Feature',
        startTime: new Date(`2026-04-11T09:${i.toString().padStart(2, '0')}:00Z`),
        endTime: new Date(`2026-04-11T10:${i.toString().padStart(2, '0')}:00Z`),
      };
      await store.addTask(task);
    }

    const recents = await store.getRecentTasks();
    expect(recents).toHaveLength(10);
    expect(recents[0].title).toBe('Task 12');
  });

  it('should update lastUsedAt for an existing recent task', async () => {
    const taskA: Task = {
      title: 'Task A',
      description: 'Desc A',
      project: 'P1',
      type: 'T1',
      startTime: new Date(),
      endTime: new Date(),
    };
    await store.addTask(taskA);

    const taskA2 = { ...taskA, description: 'Updated Desc' };
    await store.addTask(taskA2);

    const recents = await store.getRecentTasks();
    expect(recents).toHaveLength(1);
    expect(recents[0].description).toBe('Updated Desc');
  });

  it('should purge tasks older than 14 days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 15);

    // Use initDB directly to insert an old record, then close it
    const db = await initDB(currentDbName);
    await db.put('recent_tasks', {
      title: 'Old Task',
      description: 'Old',
      project: 'P1',
      type: 'T1',
      lastUsedAt: oldDate,
      isBillable: true,
    });
    await db.close();

    // Now use the store
    const recentsBefore = await store.getRecentTasks();
    expect(recentsBefore.some((t) => t.title === 'Old Task')).toBe(true);

    const newTask: Task = {
      title: 'New Task',
      description: 'New',
      project: 'P1',
      type: 'T1',
      startTime: new Date(),
      endTime: new Date(),
    };
    await store.addTask(newTask);

    const recentsAfter = await store.getRecentTasks();
    expect(recentsAfter.some((t) => t.title === 'Old Task')).toBe(false);
    expect(recentsAfter.some((t) => t.title === 'New Task')).toBe(true);
  });
});
