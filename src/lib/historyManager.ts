export interface HistoryState {
  tasks: any[]; // Using any[] to be generic or I could import Task
  date: Date;
}

export class HistoryManager<T> {
  private past: T[] = [];
  private present: T | null = null;
  private future: T[] = [];
  private maxHistory: number;

  constructor(initialState?: T, maxHistory = 50) {
    if (initialState) {
      this.present = initialState;
    }
    this.maxHistory = maxHistory;
  }

  push(newState: T) {
    if (this.present) {
      this.past.push(this.present);
      if (this.past.length > this.maxHistory) {
        this.past.shift();
      }
    }
    this.present = newState;
    this.future = [];
  }

  undo(): T | null {
    if (this.past.length === 0) return null;

    if (this.present) {
      this.future.unshift(this.present);
    }
    const next = this.past.pop();
    this.present = next || null;
    return this.present;
  }

  redo(): T | null {
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

  get pastStack(): T[] {
    return this.past;
  }

  get futureStack(): T[] {
    return this.future;
  }

  get current(): T | null {
    return this.present;
  }
}
