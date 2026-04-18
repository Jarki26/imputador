import { describe, it, expect, beforeEach } from 'vitest';
import { syncSesameTasks } from './sesameSync';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('sesameSync - syncSesameTasks', () => {
  let taskStore: TaskStore;

  beforeEach(async () => {
    const dbName = `test-sync-sesame-${Math.random().toString(36).substring(7)}`;
    taskStore = new TaskStore(dbName);
  });

  const sesameFormat = {
    title: 'Descanso',
    project: 'sesame',
    type: 'Rest',
    description: ''
  };

  it('should insert new rest tasks', async () => {
    const newRestTasks: Task[] = [
      {
        ...sesameFormat,
        startTime: new Date('2026-04-19T11:00:00Z'),
        endTime: new Date('2026-04-19T12:00:00Z')
      }
    ];

    await syncSesameTasks(newRestTasks, taskStore);

    const tasks = await taskStore.getTasksForDay(new Date('2026-04-19'));
    expect(tasks).toHaveLength(1);
    expect(tasks[0].startTime.toISOString()).toBe('2026-04-19T11:00:00.000Z');
  });

  it('should skip insertion if identical rest task exists', async () => {
    const task: Task = {
      ...sesameFormat,
      startTime: new Date('2026-04-19T11:00:00Z'),
      endTime: new Date('2026-04-19T12:00:00Z')
    };

    await taskStore.addTask(task);
    
    const newRestTasks: Task[] = [{ ...task }];
    await syncSesameTasks(newRestTasks, taskStore);

    const tasks = await taskStore.getTasksForDay(new Date('2026-04-19'));
    expect(tasks).toHaveLength(1); // Should not have added another one
  });

  it('should overwrite existing rest task if it conflicts', async () => {
    // Existing rest task (different end time)
    await taskStore.addTask({
      ...sesameFormat,
      startTime: new Date('2026-04-19T11:00:00Z'),
      endTime: new Date('2026-04-19T11:30:00Z')
    });

    const newRestTasks: Task[] = [
      {
        ...sesameFormat,
        startTime: new Date('2026-04-19T11:00:00Z'),
        endTime: new Date('2026-04-19T12:00:00Z')
      }
    ];

    await syncSesameTasks(newRestTasks, taskStore);

    const tasks = await taskStore.getTasksForDay(new Date('2026-04-19'));
    expect(tasks).toHaveLength(1);
    expect(tasks[0].endTime.toISOString()).toBe('2026-04-19T12:00:00.000Z');
  });

  it('should preserve other tasks and allow overlap', async () => {
    // Existing different task (e.g. development)
    await taskStore.addTask({
      title: 'Coding',
      project: 'my-project',
      type: 'Feature',
      description: '',
      startTime: new Date('2026-04-19T11:30:00Z'),
      endTime: new Date('2026-04-19T12:30:00Z')
    });

    const newRestTasks: Task[] = [
      {
        ...sesameFormat,
        startTime: new Date('2026-04-19T11:00:00Z'),
        endTime: new Date('2026-04-19T12:00:00Z')
      }
    ];

    await syncSesameTasks(newRestTasks, taskStore);

    const tasks = await taskStore.getTasksForDay(new Date('2026-04-19'));
    expect(tasks).toHaveLength(2); // Both should exist
  });
});
