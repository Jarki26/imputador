import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsService } from './settingsService';
import { initDB } from './db';

describe('SettingsService', () => {
  let service: SettingsService;
  let dbName: string;

  beforeEach(async () => {
    dbName = `test-settings-db-${Math.random().toString(36).substring(7)}`;
    service = new SettingsService(dbName);
  });

  describe('exportData', () => {
    it('should export all settings to a JSON structure', async () => {
      const db = await initDB(dbName);

      // Populate with test data
      await db.put('config', { key: 'weeklyHoursTarget', value: 38 });
      await db.put('config', { key: 'taskTypeColor:Dev', value: '#00ff00' });
      await db.put('projects', {
        name: 'Project 1',
        lastUsedAt: new Date('2026-01-01'),
      });
      await db.put('companies', {
        name: 'Company A',
        lastUsedAt: new Date('2026-01-01'),
        useCount: 10,
      });

      const exported = await service.exportData();

      expect(exported.version).toBe(1);
      expect(exported.config).toContainEqual({
        key: 'weeklyHoursTarget',
        value: 38,
      });
      expect(exported.config).toContainEqual({
        key: 'taskTypeColor:Dev',
        value: '#00ff00',
      });
      expect(exported.projects).toContainEqual({
        name: 'Project 1',
        lastUsedAt: expect.any(Date),
      });
      expect(exported.companies).toContainEqual({
        name: 'Company A',
        lastUsedAt: expect.any(Date),
        useCount: 10,
      });
    });
  });

  describe('importData', () => {
    it('should import settings from a JSON structure and overwrite existing data', async () => {
      const db = await initDB(dbName);

      // Populate with initial data that should be overwritten
      await db.put('config', { key: 'weeklyHoursTarget', value: 41 });
      await db.put('projects', {
        name: 'Old Project',
        lastUsedAt: new Date('2025-01-01'),
      });

      const backupData = {
        version: 1,
        config: [
          { key: 'weeklyHoursTarget', value: 35 },
          { key: 'excelDateFormat', value: 'YYYY-MM-DD' },
        ],
        projects: [
          {
            name: 'New Project',
            lastUsedAt: new Date('2026-04-16').toISOString(),
          },
        ],
        companies: [
          {
            name: 'New Company',
            lastUsedAt: new Date('2026-04-16').toISOString(),
            useCount: 1,
          },
        ],
      };

      await service.importData(backupData);

      const target = await db.get('config', 'weeklyHoursTarget');
      expect(target.value).toBe(35);

      const dateFormat = await db.get('config', 'excelDateFormat');
      expect(dateFormat.value).toBe('YYYY-MM-DD');

      const projects = await db.getAll('projects');
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe('New Project');

      const companies = await db.getAll('companies');
      expect(companies).toHaveLength(1);
      expect(companies[0].name).toBe('New Company');
    });

    it('should throw an error if the backup version is unsupported', async () => {
      const backupData = {
        version: 999,
        config: [],
        projects: [],
        companies: [],
      };

      await expect(service.importData(backupData)).rejects.toThrow(
        'Unsupported backup version: 999',
      );
    });

    it('should throw an error if the backup data is null', async () => {
      await expect(service.importData(null as any)).rejects.toThrow(
        'Invalid backup file',
      );
    });

    it('should throw an error if the backup data is not an object', async () => {
      await expect(service.importData('invalid' as any)).rejects.toThrow(
        'Invalid backup file',
      );
    });

    it('should throw an error if config is missing', async () => {
      const backupData = { version: 1, projects: [], companies: [] };
      await expect(service.importData(backupData as any)).rejects.toThrow(
        'Invalid backup file',
      );
    });

    it('should throw an error if projects is missing', async () => {
      const backupData = { version: 1, config: [], companies: [] };
      await expect(service.importData(backupData as any)).rejects.toThrow(
        'Invalid backup file',
      );
    });

    it('should throw an error if companies is missing', async () => {
      const backupData = { version: 1, config: [], projects: [] };
      await expect(service.importData(backupData as any)).rejects.toThrow(
        'Invalid backup file',
      );
    });

    it('should throw an error if version is missing', async () => {
      const backupData = { config: [], projects: [], companies: [] };
      await expect(service.importData(backupData as any)).rejects.toThrow(
        'Invalid backup file',
      );
    });
  });
});
