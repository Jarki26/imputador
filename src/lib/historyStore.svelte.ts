import { type Task } from './db';
import { HistoryManager, type HistoryState } from './historyManager';

export type { HistoryState };

export class HistoryStore {
  private manager: HistoryManager<HistoryState>;
  // We keep reactive wrappers for UI consumption
  private past_trigger = $state({ count: 0 });
  private future_trigger = $state({ count: 0 });
  private present_trigger = $state({ count: 0 });

  constructor(initialState?: HistoryState, maxHistory = 50) {
    this.manager = new HistoryManager(
      initialState ? $state.snapshot(initialState) : undefined,
      maxHistory,
    );
  }

  push(newState: HistoryState) {
    this.manager.push($state.snapshot(newState));
    this.past_trigger.count++;
    this.future_trigger.count++;
    this.present_trigger.count++;
  }

  undo(): HistoryState | null {
    const res = this.manager.undo();
    this.past_trigger.count++;
    this.future_trigger.count++;
    this.present_trigger.count++;
    return res;
  }

  redo(): HistoryState | null {
    const res = this.manager.redo();
    this.past_trigger.count++;
    this.future_trigger.count++;
    this.present_trigger.count++;
    return res;
  }

  get canUndo(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.past_trigger.count; // dependency
    return this.manager.canUndo;
  }

  get canRedo(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.future_trigger.count; // dependency
    return this.manager.canRedo;
  }

  get undoStack() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.past_trigger.count; // dependency
    return this.manager.pastStack;
  }

  get redoStack() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.future_trigger.count; // dependency
    return this.manager.futureStack;
  }

  getPastCount(): number {
    return this.manager.pastStack.length;
  }
}

