import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportService } from './importService';
import type { ColumnMapping } from './exportConfigStore';
import * as DB from './db';
import * as XLSX from 'xlsx';

vi.mock('xlsx', () => ({
  utils: {
    sheet_to_json: vi.fn(),
  },
  read: vi.fn(),
}));

vi.mock('./db', () => ({
  initDB: vi.fn(),
}));

describe('ImportService operations', () => {
  let service: ImportService;

  beforeEach(() => {
    service = new ImportService();
    vi.clearAllMocks();
  });

  it('should parse Excel data and map it based on template', async () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
      { columnName: 'Hora Inicio', taskField: 'startTime' },
      { columnName: 'Tarea', taskField: 'title' },
    ];

    const mockExcelData = [
      {
        Fecha: '14/04/2026',
        'Hora Inicio': '09:00',
        Tarea: 'Import Task',
      },
    ];

    const result = (service as any).mapRowsToTasks(mockExcelData, template);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Import Task');
    expect(result[0].startTime.getHours()).toBe(9);
  });

  it('should handle fixed values in template by ignoring them', () => {
    const template: ColumnMapping[] = [
      { columnName: 'Tarea', taskField: 'title' },
      { columnName: 'Fecha', taskField: 'startDate' },
      { columnName: 'Fijo', fixedValue: 'Constante' },
    ];

    const mockExcelData = [{ Tarea: 'Task 1', Fecha: '14/04/2026' }];

    const result = (service as any).mapRowsToTasks(mockExcelData, template);
    expect(result[0].title).toBe('Task 1');
  });

  it('should handle invalid data and aggregate errors', () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
      { columnName: 'Tarea', taskField: 'title' },
    ];

    const mockExcelData = [
      { Fecha: '14/04/2026', Tarea: 'Valid Task' },
      { Fecha: 'invalid-date', Tarea: 'Invalid Date' },
      { Fecha: '14/04/2026', Tarea: '' },
    ];

    const { tasks, errors } = (service as any).processRows(mockExcelData, template);

    expect(tasks).toHaveLength(1);
    expect(errors).toHaveLength(2);
    expect(errors[0].row).toBe(1);
    expect(errors[1].row).toBe(2);
  });

  it('should wipe database and insert tasks', async () => {
    const mockTasks = [
      { title: 'Task 1', startTime: new Date(), endTime: new Date() },
    ];

    const mockTx = {
      objectStore: vi.fn().mockReturnValue({
        clear: vi.fn().mockResolvedValue(undefined),
        add: vi.fn().mockResolvedValue(undefined),
      }),
      done: Promise.resolve(),
    };

    const mockDB = {
      transaction: vi.fn().mockReturnValue(mockTx),
    };

    (DB.initDB as any).mockResolvedValue(mockDB);

    const result = await service.importTasks(mockTasks as any);
    expect(result.successCount).toBe(1);
    expect(mockDB.transaction).toHaveBeenCalledWith('tasks', 'readwrite');
  });

  it('should handle errors during task insertion in importTasks', async () => {
    const mockTasks = [{ title: 'Task 1' }];
    const mockStore = {
      clear: vi.fn().mockResolvedValue(undefined),
      add: vi.fn().mockRejectedValue(new Error('DB Error')),
    };
    const mockTx = {
      objectStore: vi.fn().mockReturnValue(mockStore),
      done: Promise.resolve(),
    };
    const mockDB = {
      transaction: vi.fn().mockReturnValue(mockTx),
    };
    (DB.initDB as any).mockResolvedValue(mockDB);

    const result = await service.importTasks(mockTasks as any);
    expect(result.successCount).toBe(0);
    expect(result.errorCount).toBe(1);
  });

  it('should parse file using XLSX', async () => {
    const template: ColumnMapping[] = [
      { columnName: 'T', taskField: 'title' },
      { columnName: 'F', taskField: 'startDate' },
    ];
    const mockFile = new File([''], 'test.xlsx');

    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    };

    (XLSX.read as any).mockReturnValue(mockWorkbook);
    (XLSX.utils.sheet_to_json as any).mockReturnValue([{ T: 'Task from file', F: '14/04/2026' }]);

    const result = await service.parseFile(mockFile, template);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].title).toBe('Task from file');
  });
});
