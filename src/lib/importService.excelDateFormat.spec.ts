import { describe, it, expect, beforeEach } from 'vitest';
import { ImportService } from './importService';
import type { ColumnMapping } from './exportConfigStore';

describe('ImportService - Custom Excel Date Format', () => {
  let service: ImportService;

  beforeEach(() => {
    service = new ImportService();
  });

  it('should parse dates using the custom excelDateFormat (DD/MM/YYYY)', () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
      { columnName: 'Tarea', taskField: 'title' },
    ];

    const mockExcelData = [
      {
        Fecha: '14/04/2026',
        Tarea: 'Custom Format Task',
      },
    ];

    const { tasks } = (service as any).processRows(mockExcelData, template, 'DD/MM/YYYY');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].startTime.getFullYear()).toBe(2026);
    expect(tasks[0].startTime.getMonth()).toBe(3); // April is 3
    expect(tasks[0].startTime.getDate()).toBe(14);
  });

  it('should parse dates using another custom excelDateFormat (YYYY.MM.DD)', () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
      { columnName: 'Tarea', taskField: 'title' },
    ];

    const mockExcelData = [
      {
        Fecha: '2026.04.15',
        Tarea: 'Another Format Task',
      },
    ];

    const { tasks } = (service as any).processRows(mockExcelData, template, 'YYYY.MM.DD');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].startTime.getFullYear()).toBe(2026);
    expect(tasks[0].startTime.getMonth()).toBe(3); // April is 3
    expect(tasks[0].startTime.getDate()).toBe(15);
  });

  it('should fail to parse if date does not match custom format', () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
      { columnName: 'Tarea', taskField: 'title' },
    ];

    const mockExcelData = [
      {
        Fecha: '2026-04-14', // Standard format but we expect DD/MM/YYYY
        Tarea: 'Mismatched Format',
      },
    ];

    const { tasks, errors } = (service as any).processRows(mockExcelData, template, 'DD/MM/YYYY');

    expect(tasks).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('Invalid start date');
  });
});
