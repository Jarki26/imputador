import { describe, it, expect } from 'vitest';
import { calculateTotalHours, getContrastColor } from './utils';
import type { Task } from './db';

describe('getContrastColor', () => {
  it('should return black for light colors', () => {
    expect(getContrastColor('#ffffff')).toBe('black');
    expect(getContrastColor('#e5e7eb')).toBe('black');
  });

  it('should return white for dark colors', () => {
    expect(getContrastColor('#000000')).toBe('white');
    expect(getContrastColor('#111827')).toBe('white');
  });

  it('should return black for invalid colors', () => {
    expect(getContrastColor('')).toBe('black');
    expect(getContrastColor('#ff')).toBe('black');
  });
});

describe('calculateTotalHours', () => {
  it('should return 0 for empty tasks', () => {
    expect(calculateTotalHours([])).toBe(0);
  });

  it('should correctly sum hours from billable tasks', () => {
    const tasks: Partial<Task>[] = [
      {
        startTime: new Date('2026-04-09T08:00:00'),
        endTime: new Date('2026-04-09T10:00:00'), // 2 hours
        type: 'DESARROLLO'
      },
      {
        startTime: new Date('2026-04-09T11:00:00'),
        endTime: new Date('2026-04-09T12:30:00'), // 1.5 hours
        type: 'TEST'
      }
    ];
    expect(calculateTotalHours(tasks as Task[])).toBe(3.5);
  });

  it('should exclude non-billable (Rest -> REST) tasks', () => {
    const tasks: Partial<Task>[] = [
      {
        startTime: new Date('2026-04-09T08:00:00'),
        endTime: new Date('2026-04-09T10:00:00'), // 2 hours
        type: 'DESARROLLO'
      },
      {
        startTime: new Date('2026-04-09T12:00:00'),
        endTime: new Date('2026-04-09T13:00:00'), // 1 hour (Rest -> REST)
        type: 'REST'
      }
    ];
    expect(calculateTotalHours(tasks as Task[])).toBe(2);
  });
});
