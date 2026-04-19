import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('TaskStore Snap Helpers', () => {
  let store: TaskStore;
  const testDate = new Date('2026-04-19T00:00:00Z');

  beforeEach(async () => {
    const dbName = `test-snap-db-${Math.random().toString(36).substring(7)}`;
    store = new TaskStore(dbName);
  });

  async function addTask(title: string, start: string, end: string): Promise<number | undefined> {
    return await store.addTask({
      title,
      description: '',
      project: '',
      type: '',
      startTime: new Date(`2026-04-19T${start}Z`),
      endTime: new Date(`2026-04-19T${end}Z`),
    });
  }

  describe('getPreviousTask', () => {
    it('should return the closest preceding task on the same day', async () => {
      await addTask('Task 1', '08:00:00', '09:00:00');
      await addTask('Task 2', '10:00:00', '11:00:00');

      const refTime = new Date('2026-04-19T11:30:00Z');
      const prev = await store.getPreviousTask(testDate, refTime);

      expect(prev).toBeDefined();
      expect(prev?.title).toBe('Task 2');
    });

    it('should return null if no preceding task exists on the same day', async () => {
      await addTask('Task 1', '12:00:00', '13:00:00');

      const refTime = new Date('2026-04-19T11:00:00Z');
      const prev = await store.getPreviousTask(testDate, refTime);

      expect(prev).toBeNull();
    });

    it('should ignore tasks from different days', async () => {
        await store.addTask({
            title: 'Other Day Task',
            description: '',
            project: '',
            type: '',
            startTime: new Date('2026-04-18T10:00:00Z'),
            endTime: new Date('2026-04-18T11:00:00Z'),
        });

        const refTime = new Date('2026-04-19T12:00:00Z');
        const prev = await store.getPreviousTask(testDate, refTime);

        expect(prev).toBeNull();
    });

    it('should exclude the task with excludeId', async () => {
        const id1 = await addTask('Task 1', '08:00:00', '09:00:00');
        await addTask('Task 2', '10:00:00', '11:00:00');

        const refTime = new Date('2026-04-19T11:30:00Z');
        const prev = await store.getPreviousTask(testDate, refTime, id1);

        expect(prev?.title).toBe('Task 2');

        const id2 = await addTask('Task 3', '12:00:00', '13:00:00');
        const refTime2 = new Date('2026-04-19T13:30:00Z');
        const prev2 = await store.getPreviousTask(testDate, refTime2, id2);
        expect(prev2?.title).toBe('Task 2');
    });
  });

  describe('getPreviousTaskEndTime', () => {
    it('should return the endTime of the closest preceding task', async () => {
        await addTask('Task 1', '08:00:00', '09:00:00');
        const endTime = await store.getPreviousTaskEndTime(testDate, new Date('2026-04-19T09:30:00Z'));
        expect(endTime).toEqual(new Date('2026-04-19T09:00:00Z'));
    });

    it('should return null if no preceding task exists', async () => {
        const endTime = await store.getPreviousTaskEndTime(testDate, new Date('2026-04-19T09:30:00Z'));
        expect(endTime).toBeNull();
    });
  });

  describe('getNextTask', () => {
    it('should return the closest succeeding task on the same day', async () => {
      await addTask('Task 1', '08:00:00', '09:00:00');
      await addTask('Task 2', '10:00:00', '11:00:00');

      const refTime = new Date('2026-04-19T07:30:00Z');
      const next = await store.getNextTask(testDate, refTime);

      expect(next).toBeDefined();
      expect(next?.title).toBe('Task 1');
    });

    it('should return null if no succeeding task exists on the same day', async () => {
      await addTask('Task 1', '08:00:00', '09:00:00');

      const refTime = new Date('2026-04-19T10:00:00Z');
      const next = await store.getNextTask(testDate, refTime);

      expect(next).toBeNull();
    });

    it('should ignore tasks from different days', async () => {
        await store.addTask({
            title: 'Other Day Task',
            description: '',
            project: '',
            type: '',
            startTime: new Date('2026-04-20T10:00:00Z'),
            endTime: new Date('2026-04-20T11:00:00Z'),
        });

        const refTime = new Date('2026-04-19T09:00:00Z');
        const next = await store.getNextTask(testDate, refTime);

        expect(next).toBeNull();
    });

    it('should exclude the task with excludeId', async () => {
        await addTask('Task 1', '08:00:00', '09:00:00');
        const id2 = await addTask('Task 2', '10:00:00', '11:00:00');

        const refTime = new Date('2026-04-19T07:30:00Z');
        const next = await store.getNextTask(testDate, refTime, id2);

        expect(next?.title).toBe('Task 1');

        const id1 = await addTask('Task 0', '06:00:00', '07:00:00');
        const refTime2 = new Date('2026-04-19T05:30:00Z');
        const next2 = await store.getNextTask(testDate, refTime2, id1);
        expect(next2?.title).toBe('Task 1');
    });
  });

  describe('getNextTaskStartTime', () => {
    it('should return the startTime of the closest succeeding task', async () => {
        await addTask('Task 2', '10:00:00', '11:00:00');
        const startTime = await store.getNextTaskStartTime(testDate, new Date('2026-04-19T09:30:00Z'));
        expect(startTime).toEqual(new Date('2026-04-19T10:00:00Z'));
    });

    it('should return null if no succeeding task exists', async () => {
        const startTime = await store.getNextTaskStartTime(testDate, new Date('2026-04-19T09:30:00Z'));
        expect(startTime).toBeNull();
    });
  });
});
