import { type Task } from './db';

export interface HistoryState {
  tasks: Task[];
}

export class HistoryStore {
  private past = $state<HistoryState[]>([]);
  private present = $state<HistoryState | null>(null);
  private future = $state<HistoryState[]>([]);
  private maxHistory: number;

  constructor(initialState?: HistoryState, maxHistory = 50) {
    if (initialState) {
      this.present = $state.snapshot(initialState);
    }
    this.maxHistory = maxHistory;
  }

  push(newState: HistoryState) {
    if (this.present) {
      this.past.push(this.present); // Already snapshotted on entry
      if (this.past.length > this.maxHistory) {
        this.past.shift();
      }
    }
    this.present = $state.snapshot(newState);
    this.future = []; // Clear future on new action
  }

  undo(): HistoryState | null {
    if (this.past.length === 0) return null;

    if (this.present) {
      this.future.unshift(this.present);
    }
    const next = this.past.pop();
    this.present = next || null;
    return this.present;
  }

  redo(): HistoryState | null {
    if (this.future.length === 0) return null;

    if (this.present) {
      this.past.push(this.present);
    }
    const next = this.future.shift();
    this.present = next || null;
    return this.present;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  // For compatibility with the bug in +page.svelte and to make it easier for templates
  get undoStack() {
    return this.past;
  }

  get redoStack() {
    return this.future;
  }

  // For testing
  getPastCount(): number {
    return this.past.length;
  }
}
