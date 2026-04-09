import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './taskStore';
import type { Task } from './db';

describe('TaskStore CRUD operations', () => {
  let store: TaskStore;

  beforeEach(async () => {
    // Clear databases before each test
    const dbs = await window.indexedDB.databases();
    dbs.forEach((db) => {
      if (db.name) window.indexedDB.deleteDatabase(db.name);
    });
    store = new TaskStore('test-task-db');
  });

  it('should add a task and retrieve it', async () => {
    const task: Task = {
      title: 'Test Task',
      description: 'Test Description',
      project: 'Project A',
      type: 'Feature',
      startTime: new Date('2026-04-09T09:00:00Z'),
      endTime: new Date('2026-04-09T10:00:00Z'),
    };

    const id = await store.addTask(task);
    expect(id).toBeDefined();

    const tasks = await store.getTasksForDay(new Date('2026-04-09'));
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test Task');
  });

  it('should update a task', async () => {
    const task: Task = {
      title: 'Initial Task',
      description: 'Initial Desc',
      project: 'Project A',
      type: 'Bug',
      startTime: new Date('2026-04-09T09:00:00Z'),
      endTime: new Date('2026-04-09T10:00:00Z'),
    };

    const id = await store.addTask(task);
    await store.updateTask(id!, { title: 'Updated Task' });

    const tasks = await store.getTasksForDay(new Date('2026-04-09'));
    expect(tasks[0].title).toBe('Updated Task');
  });

  it('should throw error when updating non-existent task', async () => {
    await expect(store.updateTask(999, { title: 'No' })).rejects.toThrow(
      'Task with ID 999 not found',
    );
  });

  it('should delete a task', async () => {
    const task: Task = {
      title: 'To be deleted',
      description: 'Desc',
      project: 'Project B',
      type: 'Task',
      startTime: new Date('2026-04-09T11:00:00Z'),
      endTime: new Date('2026-04-09T12:00:00Z'),
    };

    const id = await store.addTask(task);
    await store.deleteTask(id!);

    const tasks = await store.getTasksForDay(new Date('2026-04-09'));
    expect(tasks).toHaveLength(0);
  });
});
