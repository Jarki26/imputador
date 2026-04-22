import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigStore } from './configStore';
import { ExportService } from './exportService';
import { initDB } from './db';

describe('Export Filename Logic', () => {
  const dbName = 'test-export-filename-db';
  let configStore: ConfigStore;
  let exportService: ExportService;

  beforeEach(async () => {
    const db = await initDB(dbName);
    await db.clear('config');
    configStore = new ConfigStore(dbName);
    exportService = new ExportService();
  });

  describe('ConfigStore - Filename Format', () => {
    it('should return default filename format if not set', async () => {
      const format = await configStore.getExcelFilenameFormat();
      expect(format).toBe('imputador_{START_YYYY}{START_MM}{START_DD}_{END_YYYY}{END_MM}{END_DD}');
    });

    it('should save and retrieve custom filename format', async () => {
      const customFormat = 'my_custom_export_{START_YYYY}_{START_MM}';
      await configStore.setExcelFilenameFormat(customFormat);
      const retrieved = await configStore.getExcelFilenameFormat();
      expect(retrieved).toBe(customFormat);
    });
  });

  describe('ExportService - Filename Generation', () => {
    it('should generate filename by replacing tokens', () => {
      const startDate = new Date(2026, 3, 13); // April 13, 2026
      const endDate = new Date(2026, 3, 19); // April 19, 2026
      const pattern = 'export_{START_YYYY}_{START_MM}_{START_DD}_to_{END_DD}';
      
      const filename = exportService.formatFilename(pattern, startDate, endDate);
      
      expect(filename).toBe('export_2026_04_13_to_19.xlsx');
    });

    it('should handle all supported tokens', () => {
      const startDate = new Date(2026, 0, 1); // Jan 1, 2026
      const endDate = new Date(2026, 11, 31); // Dec 31, 2026
      const pattern = '{START_YYYY}{START_MM}{START_DD}_{END_YYYY}{END_MM}{END_DD}';
      
      const filename = exportService.formatFilename(pattern, startDate, endDate);
      
      expect(filename).toBe('20260101_20261231.xlsx');
    });

    it('should return .xlsx even if pattern is empty', () => {
       const startDate = new Date(2026, 0, 1);
       const endDate = new Date(2026, 11, 31);
       expect(exportService.formatFilename('', startDate, endDate)).toBe('.xlsx');
    });
  });
});
