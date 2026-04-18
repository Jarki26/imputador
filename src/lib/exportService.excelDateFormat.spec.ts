import { describe, it, expect, beforeEach } from 'vitest';
import { ExportService } from './exportService';
import type { Task } from './db';
import type { ColumnMapping } from './exportConfigStore';

describe('ExportService excelDateFormat', () => {
  let service: ExportService;

  const mockTask: Task = {
    id: 1,
    title: 'Task 1',
    project: 'Project A',
    type: 'Feature',
    description: 'Desc 1',
    startTime: new Date('2026-04-13T09:00:00'),
    endTime: new Date('2026-04-13T10:30:00'),
  };

  beforeEach(() => {
    service = new ExportService();
  });

  it('should use the default format DD/MM/YYYY when no format is provided', async () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
    ];
    const rows = (service as any).mapTasksToRows(
      [mockTask],
      template,
      'DD/MM/YYYY',
    );
    expect(rows[0].Fecha).toBe('13/04/2026');
  });

  it('should use a custom format YYYY-MM-DD when provided', async () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
    ];
    const rows = (service as any).mapTasksToRows(
      [mockTask],
      template,
      'YYYY-MM-DD',
    );
    expect(rows[0].Fecha).toBe('2026-04-13');
  });

  it('should use a custom format MM/DD/YYYY when provided', async () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
    ];
    const rows = (service as any).mapTasksToRows(
      [mockTask],
      template,
      'MM/DD/YYYY',
    );
    expect(rows[0].Fecha).toBe('04/13/2026');
  });
});
