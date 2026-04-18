import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryStore, type HistoryState } from './historyStore.svelte';
import { type Task } from './db';

describe('HistoryStore', () => {
  let store: HistoryStore;
  const initialTask: Task = {
    id: 1,
    title: 'T1',
    project: 'P',
    type: 'General',
    startTime: new Date(),
    endTime: new Date(),
  };
  const nextTask: Task = {
    id: 2,
    title: 'T2',
    project: 'P',
    type: 'General',
    startTime: new Date(),
    endTime: new Date(),
  };
  const testDate = new Date('2026-04-12');

  beforeEach(() => {
    store = new HistoryStore({ tasks: [initialTask], date: testDate });
  });

  it('should push new state and clear future', () => {
    store.push({ tasks: [initialTask, nextTask], date: testDate });
    expect(store.canUndo).toBe(true);
    expect(store.canRedo).toBe(false);
  });

  it('should undo and redo', () => {
    store.push({ tasks: [initialTask, nextTask], date: testDate });
    const undone = store.undo();
    expect(undone?.tasks.length).toBe(1);
    expect(undone?.date).toEqual(testDate);
    expect(store.canRedo).toBe(true);

    const redone = store.redo();
    expect(redone?.tasks.length).toBe(2);
    expect(redone?.date).toEqual(testDate);
    expect(store.canUndo).toBe(true);
  });

  it('should limit history size', () => {
    const limitedStore = new HistoryStore({ tasks: [], date: testDate }, 5);
    for (let i = 0; i < 10; i++) {
      limitedStore.push({ tasks: [{ ...initialTask, id: i }], date: testDate });
    }
    expect(limitedStore.getPastCount()).toBe(5);
  });

  it('should return null on empty undo/redo', () => {
    expect(store.undo()).toBe(null);
    expect(store.redo()).toBe(null);
  });
});
