import { describe, it, expect, beforeEach } from 'vitest';
import { ExportConfigStore } from './exportConfigStore';
import { ExportService } from './exportService';
import type { Task } from './db';

describe('Excel Export Company Integration', () => {
  let configStore: ExportConfigStore;
  let exportService: ExportService;

  beforeEach(() => {
    const dbName = `test-export-db-${Math.random().toString(36).substring(7)}`;
    configStore = new ExportConfigStore(dbName);
    exportService = new ExportService();
  });

  it('should include company in the default template', async () => {
    const template = await configStore.getTemplate();
    const companyMapping = template.find((m) => m.taskField === 'company');
    expect(companyMapping).toBeDefined();
    expect(companyMapping?.columnName).toBe('Company');
  });

  it('should correctly map company field to output row', async () => {
    const tasks: Task[] = [
      {
        title: 'Task 1',
        description: 'Desc 1',
        project: 'Project 1',
        company: 'Company 1',
        type: 'GENERAL',
        startTime: new Date('2023-01-01T10:00:00'),
        endTime: new Date('2023-01-01T11:00:00'),
      },
    ];

    const template = [
      { columnName: 'Empresa', taskField: 'company' as any },
      { columnName: 'Titulo', taskField: 'title' as any },
    ];

    // Using private method for testing logic without full Excel generation
    const rows = (exportService as any).mapTasksToRows(tasks, template);

    expect(rows).toHaveLength(1);
    expect(rows[0]['Empresa']).toBe('Company 1');
    expect(rows[0]['Titulo']).toBe('Task 1');
  });

  it('should handle missing company field gracefully', async () => {
    const tasks: Task[] = [
      {
        title: 'Task 1',
        description: 'Desc 1',
        project: 'Project 1',
        type: 'GENERAL',
        startTime: new Date('2023-01-01T10:00:00'),
        endTime: new Date('2023-01-01T11:00:00'),
      },
    ];

    const template = [{ columnName: 'Empresa', taskField: 'company' as any }];

    const rows = (exportService as any).mapTasksToRows(tasks, template);

    expect(rows[0]['Empresa']).toBe('');
  });
});
