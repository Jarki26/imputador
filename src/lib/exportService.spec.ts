import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from './exportService';
import type { Task } from './db';
import type { ColumnMapping } from './exportConfigStore';
import { i18n } from './i18n.svelte';

vi.mock('./i18n.svelte', () => ({
  i18n: {
    t: vi.fn((key) => {
      if (key === 'task.type_rest') return 'Descanso';
      if (key === 'task.type_feature') return 'Funcionalidad';
      return key;
    }),
  },
}));

describe('ExportService operations', () => {
  let service: ExportService;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      project: 'Project A',
      type: 'Feature',
      description: 'Desc 1',
      startTime: new Date('2026-04-13T09:00:00'),
      endTime: new Date('2026-04-13T10:30:00'), // 1.5h
    },
    {
      id: 2,
      title: 'Lunch',
      project: '-',
      type: 'REST',
      description: 'Lunch time',
      startTime: new Date('2026-04-13T13:00:00'),
      endTime: new Date('2026-04-13T14:00:00'),
    },
  ];

  beforeEach(() => {
    service = new ExportService();
  });

  it('should translate task types', () => {
    const template: ColumnMapping[] = [{ columnName: 'Tipo', taskField: 'type' }];
    const rows = (service as any).mapTasksToRows(mockTasks, template);

    expect(rows[0].Tipo).toBe('Funcionalidad');
    expect(rows[1].Tipo).toBe('Descanso');
  });

  it('should map tasks to rows based on template', () => {
    const template: ColumnMapping[] = [
      { columnName: 'Proyecto', taskField: 'project' },
      { columnName: 'Descripción', taskField: 'description' },
      { columnName: 'Horas', taskField: 'duration' },
      { columnName: 'Fijo', fixedValue: 'VALOR' },
    ];

    const rows = (service as any).mapTasksToRows(mockTasks, template);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      Proyecto: 'Project A',
      Descripción: 'Desc 1',
      Horas: '1.50',
      Fijo: 'VALOR',
    });
    expect(rows[1]).toEqual({
      Proyecto: '-',
      Descripción: 'Lunch time',
      Horas: '1.00',
      Fijo: 'VALOR',
    });
  });

  it('should format date and time correctly', () => {
    const template: ColumnMapping[] = [
      { columnName: 'Fecha Inicio', taskField: 'startDate' },
      { columnName: 'Inicio', taskField: 'startTime' },
      { columnName: 'Fecha Fin', taskField: 'endDate' },
      { columnName: 'Fin', taskField: 'endTime' },
    ];

    const rows = (service as any).mapTasksToRows([mockTasks[0]], template);

    expect(rows[0]['Fecha Inicio']).toBe('2026-04-13');
    expect(rows[0]['Inicio']).toBe('09:00');
    expect(rows[0]['Fecha Fin']).toBe('2026-04-13');
    expect(rows[0]['Fin']).toBe('10:30');
  });

  it('should handle all task fields', () => {
    const template: ColumnMapping[] = [
      { columnName: 'T', taskField: 'type' },
      { columnName: 'Título', taskField: 'title' },
    ];
    const rows = (service as any).mapTasksToRows([mockTasks[0]], template);
    expect(rows[0]['T']).toBe('Funcionalidad');
    expect(rows[0]['Título']).toBe('Task 1');
  });

  it('should return empty string for unknown fields', () => {
    const template: ColumnMapping[] = [
      { columnName: '?', taskField: 'unknown' as any },
    ];
    const rows = (service as any).mapTasksToRows([mockTasks[0]], template);
    expect(rows[0]['?']).toBe('');
  });

  it('should generate a Blob', async () => {
    const template: ColumnMapping[] = [
      { columnName: 'Proyecto', taskField: 'project' },
    ];
    const blob = await service.generateExcel(mockTasks, template);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });
});
