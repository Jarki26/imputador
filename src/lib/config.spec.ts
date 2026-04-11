import { describe, it, expect } from 'vitest';
import { TASK_TYPES, getTaskType, isBillable } from './config';

describe('config', () => {
  it('should have a list of task types', () => {
    expect(TASK_TYPES.length).toBeGreaterThan(0);
  });

  it('should identify Rest as non-billable', () => {
    const rest = getTaskType('Rest');
    expect(rest).toBeDefined();
    expect(rest?.isBillable).toBe(false);
  });

  it('should identify General as billable', () => {
    const general = getTaskType('General');
    expect(general).toBeDefined();
    expect(general?.isBillable).toBe(true);
  });

  it('isBillable helper should work correctly', () => {
    expect(isBillable('Rest')).toBe(false);
    expect(isBillable('General')).toBe(true);
    expect(isBillable('Unknown')).toBe(true); // Default to billable
  });
});
