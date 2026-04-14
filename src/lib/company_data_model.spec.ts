import { describe, it, expect } from 'vitest';
import type { Task, Company } from './db';

describe('Company Data Model', () => {
  it('should have a Company interface defined', () => {
    const company: Company = {
      name: 'Test Company',
      lastUsedAt: new Date(),
      useCount: 1
    };
    expect(company.name).toBe('Test Company');
  });

  it('should allow an optional company field in Task interface', () => {
    const task: Task = {
      title: 'Test Task',
      description: 'Test Description',
      project: 'Project A',
      type: 'Feature',
      startTime: new Date(),
      endTime: new Date(),
      company: 'Test Company'
    };
    expect(task.company).toBe('Test Company');
  });
});
