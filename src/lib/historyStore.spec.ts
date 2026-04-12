import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryStore, type HistoryState } from './historyStore';
import { type Task } from './db';

describe('HistoryStore', () => {
  let store: HistoryStore;
  const initialTask: Task = { id: 1, title: 'T1', project: 'P', type: 'General', startTime: new Date(), endTime: new Date() };
  const nextTask: Task = { id: 2, title: 'T2', project: 'P', type: 'General', startTime: new Date(), endTime: new Date() };

  beforeEach(() => {
    store = new HistoryStore({ tasks: [initialTask] });
  });

  it('should push new state and clear future', () => {
    store.push({ tasks: [initialTask, nextTask] });
    expect(store.canUndo()).toBe(true);
    expect(store.canRedo()).toBe(false);
  });

  it('should undo and redo', () => {
    store.push({ tasks: [initialTask, nextTask] });
    const undone = store.undo();
    expect(undone?.tasks.length).toBe(1);
    expect(store.canRedo()).toBe(true);

    const redone = store.redo();
    expect(redone?.tasks.length).toBe(2);
    expect(store.canUndo()).toBe(true);
  });

  it('should limit history size', () => {
    const limitedStore = new HistoryStore({ tasks: [] }, 5);
    for (let i = 0; i < 10; i++) {
      limitedStore.push({ tasks: [{ ...initialTask, id: i }] });
    }
    expect(limitedStore.getPastCount()).toBe(5);
  });

  it('should return null on empty undo/redo', () => {
    expect(store.undo()).toBe(null);
    expect(store.redo()).toBe(null);
  });
});
