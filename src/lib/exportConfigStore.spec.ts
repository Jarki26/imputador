import { describe, it, expect, beforeEach } from 'vitest';
import { ExportConfigStore, type ColumnMapping } from './exportConfigStore';

describe('ExportConfigStore operations', () => {
  let store: ExportConfigStore;

  beforeEach(async () => {
    const dbName = `test-export-config-db-${Math.random().toString(36).substring(7)}`;
    store = new ExportConfigStore(dbName);
  });

  it('should return default template when none is set', async () => {
    const template = await store.getTemplate();
    expect(template).toBeDefined();
    expect(template.length).toBeGreaterThan(0);
    // Standard default mapping: Start Date, Start Time, End Date, End Time, Project, Task Type, Description
    expect(template.some(m => m.taskField === 'startDate')).toBe(true);
  });

  it('should save and retrieve a custom template', async () => {
    const customTemplate: ColumnMapping[] = [
      { columnName: 'Fecha', taskField: 'startDate' },
      { columnName: 'Proyecto', taskField: 'project' },
      { columnName: 'Empresa', fixedValue: 'Mi Empresa' }
    ];
    await store.setTemplate(customTemplate);
    const retrieved = await store.getTemplate();
    expect(retrieved).toEqual(customTemplate);
  });

  it('should return empty exclusions by default', async () => {
    const exclusions = await store.getExclusions();
    expect(exclusions).toEqual([]);
  });

  it('should save and retrieve task type exclusions', async () => {
    const excludedTypes = ['Rest', 'Personal'];
    await store.setExclusions(excludedTypes);
    const retrieved = await store.getExclusions();
    expect(retrieved).toEqual(excludedTypes);
  });
});
