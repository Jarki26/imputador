import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigStore } from './configStore';

describe('ConfigStore excelDateFormat', () => {
  let store: ConfigStore;

  beforeEach(async () => {
    // Use unique database name per test for isolation
    const dbName = `test-config-excel-db-${Math.random().toString(36).substring(7)}`;
    store = new ConfigStore(dbName);
  });

  it('should return default value of "DD/MM/YYYY" when no format is set', async () => {
    // @ts-expect-error - testing new method before implementation
    const format = await store.getExcelDateFormat();
    expect(format).toBe('DD/MM/YYYY');
  });

  it('should save and retrieve a new date format', async () => {
    const newFormat = 'YYYY/MM/DD';
    // @ts-expect-error - testing new method before implementation
    await store.setExcelDateFormat(newFormat);
    // @ts-expect-error - testing new method before implementation
    const format = await store.getExcelDateFormat();
    expect(format).toBe(newFormat);
  });
});
