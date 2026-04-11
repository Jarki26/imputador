import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('TaskStore - Edit Collision Logic', () => {
  let store: TaskStore;

  beforeEach(() => {
    store = new TaskStore('test-db-edit-collision-' + Math.random());
  });

  it('should overwrite existing tasks when updating with overwrite strategy', async () => {
    // 1. Create a base task
    const id1 = await store.addTask({
      title: 'Task 1',
      project: 'P1',
      type: 'General',
      startTime: new Date('2026-04-06T09:00:00Z'),
      endTime: new Date('2026-04-06T10:00:00Z'),
      date: new Date('2026-04-06T00:00:00Z'),
    } as Task);

    // 2. Create another task
    const id2 = await store.addTask({
      title: 'Task 2',
      project: 'P2',
      type: 'General',
      startTime: new Date('2026-04-06T11:00:00Z'),
      endTime: new Date('2026-04-06T12:00:00Z'),
      date: new Date('2026-04-06T00:00:00Z'),
    } as Task);

    // 3. Update Task 1 to overlap Task 2 using overwrite
    // New Task 1: 10:30 - 11:30 (should truncate Task 2 to start at 11:30)
    await (store as any).updateWithOverwrite(id1!, {
      startTime: new Date('2026-04-06T10:30:00Z'),
      endTime: new Date('2026-04-06T11:30:00Z'),
    });

    const tasks = await store.getTasksForDay(new Date('2026-04-06'));
    const t1 = tasks.find(t => t.id === id1);
    const t2 = tasks.find(t => t.id === id2);

    expect(t1?.startTime.getUTCHours()).toBe(10);
    expect(t1?.startTime.getUTCMinutes()).toBe(30);
    
    expect(t2?.startTime.getUTCHours()).toBe(11);
    expect(t2?.startTime.getUTCMinutes()).toBe(30); // Truncated start
  });

  it('should displace existing tasks when updating with displacement strategy', async () => {
    // 1. Create Task 1
    const id1 = await store.addTask({
      title: 'Task 1',
      project: 'P1',
      type: 'General',
      startTime: new Date('2026-04-06T09:00:00Z'),
      endTime: new Date('2026-04-06T10:00:00Z'),
      date: new Date('2026-04-06T00:00:00Z'),
    } as Task);

    // 2. Create Task 2
    const id2 = await store.addTask({
      title: 'Task 2',
      project: 'P2',
      type: 'General',
      startTime: new Date('2026-04-06T10:30:00Z'),
      endTime: new Date('2026-04-06T11:30:00Z'),
      date: new Date('2026-04-06T00:00:00Z'),
    } as Task);

    // 3. Move Task 1 forward to 10:00 - 11:00
    // Task 2 (starts at 10:30) should be pushed to start at 11:00
    await (store as any).updateWithDisplacement(id1!, {
      startTime: new Date('2026-04-06T10:00:00Z'),
      endTime: new Date('2026-04-06T11:00:00Z'),
    });

    const tasks = await store.getTasksForDay(new Date('2026-04-06'));
    const t1 = tasks.find(t => t.id === id1);
    const t2 = tasks.find(t => t.id === id2);

    expect(t1?.startTime.getUTCHours()).toBe(10);
    expect(t2?.startTime.getUTCHours()).toBe(11); // Pushed
    expect(t2?.endTime.getUTCHours()).toBe(12); // Duration maintained
  });
});
