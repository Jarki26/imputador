import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('TaskStore Smart Fill Logic', () => {
  let store: TaskStore;

  beforeEach(async () => {
    // Clear databases before each test
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      if (db.name) await window.indexedDB.deleteDatabase(db.name);
    }
    store = new TaskStore('test-smartfill-db');
  });

  it('should fill a single large gap at the beginning of the day', async () => {
    const taskData: Omit<Task, 'startTime' | 'endTime'> = {
      title: 'Fill Task',
      description: 'Desc',
      project: 'Project A',
      type: 'Feature',
    };

    // 2 hours in ms
    const durationMs = 2 * 60 * 60 * 1000;
    const startDate = new Date(2026, 3, 11); // Local April 11

    await store.addWithSmartFill(taskData, startDate, durationMs);

    const tasks = await store.getTasksForDay(startDate);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].startTime.getHours()).toBe(0);
    expect(tasks[0].endTime.getHours()).toBe(2);
  });

  it('should fill multiple gaps around existing tasks', async () => {
    const startDate = new Date(2026, 3, 11);
    const tenAM = new Date(2026, 3, 11, 10, 0);
    const elevenAM = new Date(2026, 3, 11, 11, 0);

    // Existing: Task X (10:00-11:00)
    await store.addTask({
      title: 'Task X',
      startTime: tenAM,
      endTime: elevenAM,
      description: '',
      project: '',
      type: '',
    });

    const taskData: Omit<Task, 'startTime' | 'endTime'> = {
      title: 'Fill Task',
      description: '',
      project: '',
      type: '',
    };

    // 3 hours in ms.
    const durationMs = 3 * 60 * 60 * 1000;

    await store.addWithSmartFill(taskData, startDate, durationMs);

    const tasks = (await store.getTasksForDay(startDate)).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Fill Task');
    expect(tasks[0].startTime.getHours()).toBe(0);
    expect(tasks[0].endTime.getHours()).toBe(3);
  });

  it('should distribute duration across multiple gaps', async () => {
    const startDate = new Date(2026, 3, 11);
    const startOfLongTask = new Date(2026, 3, 11, 0, 0);
    const endOfLongTask = new Date(2026, 3, 11, 23, 0);

    // Existing: Task X (00:00 - 23:00) -> Gap is 23:00 - 24:00 (1h)
    await store.addTask({
      title: 'Long Task',
      startTime: startOfLongTask,
      endTime: endOfLongTask,
      description: '',
      project: '',
      type: '',
    });

    const taskData: Omit<Task, 'startTime' | 'endTime'> = {
      title: 'Fill Task',
      description: '',
      project: '',
      type: '',
    };

    // 2 hours in ms.
    const durationMs = 2 * 60 * 60 * 1000;

    await store.addWithSmartFill(taskData, startDate, durationMs);

    const tasksDay1 = await store.getTasksForDay(startDate);
    const tasksDay2 = await store.getTasksForDay(new Date(2026, 3, 12));

    const fillTaskDay1 = tasksDay1.find((t) => t.title === 'Fill Task');
    expect(fillTaskDay1).toBeDefined();
    expect(fillTaskDay1?.startTime.getHours()).toBe(23);

    const fillTaskDay2 = tasksDay2.find((t) => t.title === 'Fill Task');
    expect(fillTaskDay2).toBeDefined();
    expect(fillTaskDay2?.startTime.getHours()).toBe(0);
    expect(fillTaskDay2?.endTime.getHours()).toBe(1);
  });
});
