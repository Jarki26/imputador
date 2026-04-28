import { describe, it, expect } from 'vitest';
import { ConfigStore } from './configStore';

describe('ConfigStore basic check', () => {
  it('should have all required methods', () => {
    const store = new ConfigStore();
    expect(typeof store.getWeeklyHoursTarget).toBe('function');
    expect(typeof store.getExcelDateFormat).toBe('function');
    expect(typeof store.getExcelFilenameFormat).toBe('function');
    expect(typeof store.getSesameProxyUrl).toBe('function');
  });
});
