import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('TaskStore Overwrite Logic', () => {
  let store: TaskStore;

  beforeEach(async () => {
    // Clear databases before each test
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      if (db.name) await window.indexedDB.deleteDatabase(db.name);
    }
    store = new TaskStore('test-overwrite-db');
  });

  it('should split an existing task when a new one is inserted in the middle (Middle Overlap)', async () => {
    const existingTask: Task = {
      title: 'Original Task',
      description: 'Original Desc',
      project: 'Project A',
      type: 'Feature',
      startTime: new Date('2026-04-11T09:00:00Z'),
      endTime: new Date('2026-04-11T11:00:00Z'),
    };

    await store.addTask(existingTask);

    const newTask: Task = {
      title: 'New Task',
      description: 'New Desc',
      project: 'Project B',
      type: 'Bug',
      startTime: new Date('2026-04-11T10:00:00Z'),
      endTime: new Date('2026-04-11T10:30:00Z'),
    };

    await store.addWithOverwrite(newTask);

    const tasks = await store.getTasksForDay(new Date('2026-04-11'));

    // We expect 3 tasks: Original (09:00-10:00), New (10:00-10:30), Original (10:30-11:00)
    expect(tasks).toHaveLength(3);

    const sortedTasks = tasks.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    expect(sortedTasks[0].title).toBe('Original Task');
    expect(sortedTasks[0].startTime.toISOString()).toBe(
      '2026-04-11T09:00:00.000Z',
    );
    expect(sortedTasks[0].endTime.toISOString()).toBe(
      '2026-04-11T10:00:00.000Z',
    );

    expect(sortedTasks[1].title).toBe('New Task');
    expect(sortedTasks[1].startTime.toISOString()).toBe(
      '2026-04-11T10:00:00.000Z',
    );
    expect(sortedTasks[1].endTime.toISOString()).toBe(
      '2026-04-11T10:30:00.000Z',
    );

    expect(sortedTasks[2].title).toBe('Original Task');
    expect(sortedTasks[2].startTime.toISOString()).toBe(
      '2026-04-11T10:30:00.000Z',
    );
    expect(sortedTasks[2].endTime.toISOString()).toBe(
      '2026-04-11T11:00:00.000Z',
    );
  });

  it('should truncate the end of an existing task when a new one overlaps its end (End Overlap)', async () => {
    const existingTask: Task = {
      title: 'Original Task',
      startTime: new Date('2026-04-11T09:00:00Z'),
      endTime: new Date('2026-04-11T11:00:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addTask(existingTask);

    const newTask: Task = {
      title: 'New Task',
      startTime: new Date('2026-04-11T10:30:00Z'),
      endTime: new Date('2026-04-11T11:30:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addWithOverwrite(newTask);

    const tasks = (await store.getTasksForDay(new Date('2026-04-11'))).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Original Task');
    expect(tasks[0].endTime.toISOString()).toBe('2026-04-11T10:30:00.000Z');
    expect(tasks[1].title).toBe('New Task');
    expect(tasks[1].startTime.toISOString()).toBe('2026-04-11T10:30:00.000Z');
  });

  it('should truncate the start of an existing task when a new one overlaps its start (Start Overlap)', async () => {
    const existingTask: Task = {
      title: 'Original Task',
      startTime: new Date('2026-04-11T09:00:00Z'),
      endTime: new Date('2026-04-11T11:00:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addTask(existingTask);

    const newTask: Task = {
      title: 'New Task',
      startTime: new Date('2026-04-11T08:30:00Z'),
      endTime: new Date('2026-04-11T09:30:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addWithOverwrite(newTask);

    const tasks = (await store.getTasksForDay(new Date('2026-04-11'))).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('New Task');
    expect(tasks[0].endTime.toISOString()).toBe('2026-04-11T09:30:00.000Z');
    expect(tasks[1].title).toBe('Original Task');
    expect(tasks[1].startTime.toISOString()).toBe('2026-04-11T09:30:00.000Z');
  });

  it('should delete existing tasks entirely when completely overlapped', async () => {
    const task1: Task = {
      title: 'Task 1',
      startTime: new Date('2026-04-11T09:00:00Z'),
      endTime: new Date('2026-04-11T10:00:00Z'),
      description: '',
      project: '',
      type: '',
    };
    const task2: Task = {
      title: 'Task 2',
      startTime: new Date('2026-04-11T10:30:00Z'),
      endTime: new Date('2026-04-11T11:00:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addTask(task1);
    await store.addTask(task2);

    const newTask: Task = {
      title: 'Big Task',
      startTime: new Date('2026-04-11T08:00:00Z'),
      endTime: new Date('2026-04-11T12:00:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addWithOverwrite(newTask);

    const tasks = await store.getTasksForDay(new Date('2026-04-11'));
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Big Task');
  });
});
