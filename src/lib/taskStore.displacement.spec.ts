import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('TaskStore Displacement Logic', () => {
  let store: TaskStore;

  beforeEach(async () => {
    // Clear databases before each test
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      if (db.name) await window.indexedDB.deleteDatabase(db.name);
    }
    store = new TaskStore('test-displacement-db');
  });

  it('should split and shift an existing task when a new one is inserted in the middle', async () => {
    const taskA: Task = {
      title: 'Task A',
      startTime: new Date('2026-04-11T09:00:00Z'),
      endTime: new Date('2026-04-11T11:00:00Z'),
      description: '',
      project: '',
      type: '',
    };
    await store.addTask(taskA);

    const taskB: Task = {
      title: 'Task B',
      startTime: new Date('2026-04-11T10:00:00Z'),
      endTime: new Date('2026-04-11T10:30:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addWithDisplacement(taskB);

    const tasks = (await store.getTasksForDay(new Date('2026-04-11'))).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    // We expect 3 tasks: Task A (09:00-10:00), Task B (10:00-10:30), Task A (10:30-11:30)
    expect(tasks).toHaveLength(3);

    expect(tasks[0].title).toBe('Task A');
    expect(tasks[0].startTime.toISOString()).toBe('2026-04-11T09:00:00.000Z');
    expect(tasks[0].endTime.toISOString()).toBe('2026-04-11T10:00:00.000Z');

    expect(tasks[1].title).toBe('Task B');
    expect(tasks[1].startTime.toISOString()).toBe('2026-04-11T10:00:00.000Z');
    expect(tasks[1].endTime.toISOString()).toBe('2026-04-11T10:30:00.000Z');

    expect(tasks[2].title).toBe('Task A');
    expect(tasks[2].startTime.toISOString()).toBe('2026-04-11T10:30:00.000Z');
    expect(tasks[2].endTime.toISOString()).toBe('2026-04-11T11:30:00.000Z');
  });

  it('should shift a subsequent task entirely if it starts during the new task', async () => {
    const taskA: Task = {
      title: 'Task A',
      startTime: new Date('2026-04-11T10:00:00Z'),
      endTime: new Date('2026-04-11T11:00:00Z'),
      description: '',
      project: '',
      type: '',
    };
    await store.addTask(taskA);

    const taskB: Task = {
      title: 'Task B',
      startTime: new Date('2026-04-11T09:30:00Z'),
      endTime: new Date('2026-04-11T10:30:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addWithDisplacement(taskB);

    const tasks = (await store.getTasksForDay(new Date('2026-04-11'))).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task B');
    expect(tasks[0].startTime.toISOString()).toBe('2026-04-11T09:30:00.000Z');
    expect(tasks[0].endTime.toISOString()).toBe('2026-04-11T10:30:00.000Z');

    expect(tasks[1].title).toBe('Task A');
    expect(tasks[1].startTime.toISOString()).toBe('2026-04-11T10:30:00.000Z');
    expect(tasks[1].endTime.toISOString()).toBe('2026-04-11T11:30:00.000Z');
  });

  it('should recursively shift subsequent tasks', async () => {
    // Task A (10:00-11:00)
    // Task C (11:00-12:00)
    // Task B (10:30-10:45)
    // Result:
    // A (10:00-10:30)
    // B (10:30-10:45)
    // A (10:45-11:15) (shifted 30m of original A)
    // C (11:15-12:15) (shifted C to avoid overlap with shifted A)

    await store.addTask({
      title: 'Task A',
      startTime: new Date('2026-04-11T10:00:00Z'),
      endTime: new Date('2026-04-11T11:00:00Z'),
      description: '',
      project: '',
      type: '',
    });
    await store.addTask({
      title: 'Task C',
      startTime: new Date('2026-04-11T11:00:00Z'),
      endTime: new Date('2026-04-11T12:00:00Z'),
      description: '',
      project: '',
      type: '',
    });

    const taskB: Task = {
      title: 'Task B',
      startTime: new Date('2026-04-11T10:30:00Z'),
      endTime: new Date('2026-04-11T10:45:00Z'),
      description: '',
      project: '',
      type: '',
    };

    await store.addWithDisplacement(taskB);

    const tasks = (await store.getTasksForDay(new Date('2026-04-11'))).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    expect(tasks).toHaveLength(4);
    expect(tasks[0].title).toBe('Task A');
    expect(tasks[0].startTime.toISOString()).toBe('2026-04-11T10:00:00.000Z');
    expect(tasks[0].endTime.toISOString()).toBe('2026-04-11T10:30:00.000Z');

    expect(tasks[1].title).toBe('Task B');
    expect(tasks[1].startTime.toISOString()).toBe('2026-04-11T10:30:00.000Z');
    expect(tasks[1].endTime.toISOString()).toBe('2026-04-11T10:45:00.000Z');

    expect(tasks[2].title).toBe('Task A');
    expect(tasks[2].startTime.toISOString()).toBe('2026-04-11T10:45:00.000Z');
    expect(tasks[2].endTime.toISOString()).toBe('2026-04-11T11:15:00.000Z');

    expect(tasks[3].title).toBe('Task C');
    expect(tasks[3].startTime.toISOString()).toBe('2026-04-11T11:15:00.000Z');
    expect(tasks[3].endTime.toISOString()).toBe('2026-04-11T12:15:00.000Z');
  });
});
