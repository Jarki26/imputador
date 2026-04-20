import { initDB } from './db';
import { getTaskType, TASK_TYPES } from './config';

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
   * Defaults to '#e5e7eb' or task type defaultColor if not found.
   */
  async getTaskTypeColor(taskType: string): Promise<string> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', `taskTypeColor:${taskType}`);
    if (config) return config.value;

    const typeConfig = getTaskType(taskType);
    return typeConfig?.defaultColor || '#e5e7eb';
  }

  /**
   * Saves the color for a specific task type.
   */
  async setTaskTypeColor(taskType: string, color: string): Promise<void> {
    const db = await initDB(this.dbName);
    await db.put('config', { key: `taskTypeColor:${taskType}`, value: color });
  }

  /**
   * Retrieves all custom color mappings for task types, including defaults.
   */
  async getAllTaskTypeColors(): Promise<Record<string, string>> {
    const db = await initDB(this.dbName);
    const allConfig = await db.getAll('config');
    const colors: Record<string, string> = {};

    // First populate with defaults from TASK_TYPES
    for (const type of TASK_TYPES) {
      if (type.defaultColor) {
        colors[type.name] = type.defaultColor;
      }
    }

    for (const item of allConfig) {
      if (item.key.startsWith('taskTypeColor:')) {
        const type = item.key.replace('taskTypeColor:', '');
        colors[type] = item.value;
      }
    }
    return colors;
  }

  /**
   * Sesame HR Integration Methods
   */

  async getSesameToken(): Promise<string | null> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', 'sesameToken');
    return config ? config.value : null;
  }

  async setSesameToken(token: string | null): Promise<void> {
    const db = await initDB(this.dbName);
    if (token === null) {
      await db.delete('config', 'sesameToken');
    } else {
      await db.put('config', { key: 'sesameToken', value: token });
    }
  }

  async getSesameUserId(): Promise<string | null> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', 'sesameUserId');
    return config ? config.value : null;
  }

  async setSesameUserId(id: string | null): Promise<void> {
    const db = await initDB(this.dbName);
    if (id === null) {
      await db.delete('config', 'sesameUserId');
    } else {
      await db.put('config', { key: 'sesameUserId', value: id });
    }
  }

  async getSesameEmail(): Promise<string | null> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', 'sesameEmail');
    return config ? config.value : null;
  }

  async setSesameEmail(email: string | null): Promise<void> {
    const db = await initDB(this.dbName);
    if (email === null) {
      await db.delete('config', 'sesameEmail');
    } else {
      await db.put('config', { key: 'sesameEmail', value: email });
    }
  }

  async getSesameProxyUrl(): Promise<string | null> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', 'sesameProxyUrl');
    return config ? config.value : null;
  }

  async setSesameProxyUrl(url: string | null): Promise<void> {
    const db = await initDB(this.dbName);
    if (url === null) {
      await db.delete('config', 'sesameProxyUrl');
    } else {
      await db.put('config', { key: 'sesameProxyUrl', value: url });
    }
  }
}
