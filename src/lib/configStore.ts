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
}
