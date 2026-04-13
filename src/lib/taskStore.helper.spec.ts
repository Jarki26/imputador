import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('TaskStore Helper Functions', () => {
  let store: TaskStore;

  beforeEach(async () => {
    const dbName = `test-task-helper-db-${Math.random().toString(36).substring(7)}`;
    store = new TaskStore(dbName);
  });

  describe('getLatestTaskOfDay', () => {
    it('should return null if no tasks exist for the day', async () => {
      const latest = await store.getLatestTaskOfDay(new Date('2026-04-13'));
      expect(latest).toBeNull();
    });

    it('should return the chronologically latest task of the day', async () => {
      const date = new Date('2026-04-13');
      
      await store.addTask({
        title: 'Task 1',
        startTime: new Date('2026-04-13T09:00:00Z'),
        endTime: new Date('2026-04-13T10:00:00Z'),
        description: '', project: '', type: ''
      });

      await store.addTask({
        title: 'Task 2',
        startTime: new Date('2026-04-13T14:00:00Z'),
        endTime: new Date('2026-04-13T15:00:00Z'),
        description: '', project: '', type: ''
      });

      await store.addTask({
        title: 'Task 3',
        startTime: new Date('2026-04-13T11:00:00Z'),
        endTime: new Date('2026-04-13T12:00:00Z'),
        description: '', project: '', type: ''
      });

      const latest = await store.getLatestTaskOfDay(date);
      expect(latest).toBeDefined();
      expect(latest?.title).toBe('Task 2');
    });
  });

  describe('getClosestPrecedingTask', () => {
    it('should return null if no preceding tasks exist on that day', async () => {
      const date = new Date('2026-04-13T10:00:00Z');
      const closest = await store.getClosestPrecedingTask(date);
      expect(closest).toBeNull();
    });

    it('should return the task that ends closest to but before the given time', async () => {
      await store.addTask({
        title: 'Task 1',
        startTime: new Date('2026-04-13T08:00:00Z'),
        endTime: new Date('2026-04-13T09:00:00Z'),
        description: '', project: '', type: ''
      });

      await store.addTask({
        title: 'Task 2',
        startTime: new Date('2026-04-13T10:00:00Z'),
        endTime: new Date('2026-04-13T11:00:00Z'),
        description: '', project: '', type: ''
      });

      // Target time: 10:30 (should get Task 2 if it's strictly before 10:30? 
      // Wait, Task 2 ends at 11:00. 10:30 is DURING Task 2.
      // If I click 10:30, and Task 2 ends at 11:00, Task 2 is NOT preceding 10:30?
      // Actually, if I click 11:30, I should get Task 2.
      
      const targetTime = new Date('2026-04-13T11:30:00Z');
      const closest = await store.getClosestPrecedingTask(targetTime);
      expect(closest).toBeDefined();
      expect(closest?.title).toBe('Task 2');
    });

    it('should return null if all tasks for the day start after the given time', async () => {
      await store.addTask({
        title: 'Future Task',
        startTime: new Date('2026-04-13T14:00:00Z'),
        endTime: new Date('2026-04-13T15:00:00Z'),
        description: '', project: '', type: ''
      });

      const targetTime = new Date('2026-04-13T10:00:00Z');
      const closest = await store.getClosestPrecedingTask(targetTime);
      expect(closest).toBeNull();
    });
  });
});
