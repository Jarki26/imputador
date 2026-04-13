import { initDB } from './db';

/**
 * Interface for a column mapping in the Excel export template.
 */
export interface ColumnMapping {
  columnName: string;
  taskField?:
    | 'startDate'
    | 'startTime'
    | 'endDate'
    | 'endTime'
    | 'project'
    | 'type'
    | 'description'
    | 'duration';
  fixedValue?: string;
}

/**
 * Service to manage Excel export configuration persisted in IndexedDB.
 */
export class ExportConfigStore {
  constructor(private dbName: string = 'imputador-db') {}

  /**
   * Retrieves the export template mapping from the config store.
   * Returns a default mapping if none is set.
   */
  async getTemplate(): Promise<ColumnMapping[]> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', 'exportTemplate');
    if (config) {
      return config.value;
    }

    // Default template
    return [
      { columnName: 'Start Date', taskField: 'startDate' },
      { columnName: 'Start Time', taskField: 'startTime' },
      { columnName: 'End Date', taskField: 'endDate' },
      { columnName: 'End Time', taskField: 'endTime' },
      { columnName: 'Project', taskField: 'project' },
      { columnName: 'Task Type', taskField: 'type' },
      { columnName: 'Description', taskField: 'description' },
      { columnName: 'Duration', taskField: 'duration' },
    ];
  }

  /**
   * Saves the export template mapping to the config store.
   */
  async setTemplate(template: ColumnMapping[]): Promise<void> {
    const db = await initDB(this.dbName);
    await db.put('config', { key: 'exportTemplate', value: template });
  }

  /**
   * Retrieves the task types to be excluded from export.
   */
  async getExclusions(): Promise<string[]> {
    const db = await initDB(this.dbName);
    const config = await db.get('config', 'exportExclusions');
    return config ? config.value : [];
  }

  /**
   * Saves the task types to be excluded from export.
   */
  async setExclusions(exclusions: string[]): Promise<void> {
    const db = await initDB(this.dbName);
    await db.put('config', { key: 'exportExclusions', value: exclusions });
  }
}
