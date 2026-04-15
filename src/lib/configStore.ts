import { initDB } from './db';

/**
 * Service to manage application configuration persisted in IndexedDB.
 */
export class ConfigStore {
  constructor(private dbName: string = 'imputador-db') {}

  /**
   * Retrieves the weekly hours target from the config store.
   * Defaults to 41 if not found.
   */
  async getWeeklyHoursTarget(): Promise<number> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', 'weeklyHoursTarget');
    return config ? config.value : 41;
  }

  /**
   * Saves the weekly hours target to the config store.
   */
  async setWeeklyHoursTarget(target: number): Promise<void> {
    const db = await initDB(this.dbName);
    await db.put('config', { key: 'weeklyHoursTarget', value: target });
  }

  /**
   * Retrieves the Excel date format from the config store.
   * Defaults to 'DD/MM/YYYY' if not found.
   */
  async getExcelDateFormat(): Promise<string> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', 'excelDateFormat');
    return config ? config.value : 'DD/MM/YYYY';
  }

  /**
   * Saves the Excel date format to the config store.
   */
  async setExcelDateFormat(format: string): Promise<void> {
    const db = await initDB(this.dbName);
    await db.put('config', { key: 'excelDateFormat', value: format });
  }

  /**
   * Retrieves the color for a specific task type.
   * Defaults to '#e5e7eb' if not found.
   */
  async getTaskTypeColor(taskType: string): Promise<string> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', `taskTypeColor:${taskType}`);
    return config ? config.value : '#e5e7eb';
  }

  /**
   * Saves the color for a specific task type.
   */
  async setTaskTypeColor(taskType: string, color: string): Promise<void> {
    const db = await initDB(this.dbName);
    await db.put('config', { key: `taskTypeColor:${taskType}`, value: color });
  }

  /**
   * Retrieves all custom color mappings for task types.
   */
  async getAllTaskTypeColors(): Promise<Record<string, string>> {
    const db = await initDB(this.dbName);
    const allConfig = await db.getAll('config');
    const colors: Record<string, string> = {};
    for (const item of allConfig) {
      if (item.key.startsWith('taskTypeColor:')) {
        const type = item.key.replace('taskTypeColor:', '');
        colors[type] = item.value;
      }
    }
    return colors;
  }
}
