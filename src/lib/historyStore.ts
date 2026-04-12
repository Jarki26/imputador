import { type Task } from './db';

export interface HistoryState {
  tasks: Task[];
}

export class HistoryStore {
  private past: HistoryState[] = [];
  private present: HistoryState | null = null;
  private future: HistoryState[] = [];
  private maxHistory: number;

  constructor(initialState?: HistoryState, maxHistory = 50) {
    if (initialState) {
      this.present = initialState;
    }
    this.maxHistory = maxHistory;
  }

  push(newState: HistoryState) {
    if (this.present) {
      this.past.push(this.present);
      if (this.past.length > this.maxHistory) {
        this.past.shift();
      }
    }
    this.present = newState;
    this.future = []; // Clear future on new action
  }

  undo(): HistoryState | null {
    if (this.past.length === 0) return null;

    if (this.present) {
      this.future.unshift(this.present);
    }
    this.present = this.past.pop() || null;
    return this.present;
  }

  redo(): HistoryState | null {
    if (this.future.length === 0) return null;

    if (this.present) {
      this.past.push(this.present);
    }
    this.present = this.future.shift() || null;
    return this.present;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  // For testing
  getPastCount(): number {
    return this.past.length;
  }
}
