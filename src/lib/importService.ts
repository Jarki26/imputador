import * as XLSX from 'xlsx';
import { initDB, type Task } from './db';
import type { ColumnMapping } from './exportConfigStore';

/**
 * Service to handle Excel/CSV data import.
 */
export class ImportService {
  /**
   * Parses the provided file and returns a list of tasks and errors.
   */
  async parseFile(
    file: File,
    template: ColumnMapping[],
    excelDateFormat: string = 'DD/MM/YYYY',
  ): Promise<{ tasks: any[]; errors: any[] }> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    return this.processRows(rows, template, excelDateFormat);
  }

  /**
   * Imports a list of tasks into the database after wiping it.
   */
  async importTasks(tasks: Task[]): Promise<{ successCount: number; errorCount: number }> {
    const db = await initDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    await store.clear();

    let successCount = 0;
    let errorCount = 0;

    for (const task of tasks) {
      try {
        await store.add(task);
        successCount++;
      } catch (err) {
        console.error('Error importing task:', err);
        errorCount++;
      }
    }

    await tx.done;
    return { successCount, errorCount };
  }

  /**
   * Processes rows, validates them, and aggregates errors.
   */
  private processRows(
    rows: any[],
    template: ColumnMapping[],
    excelDateFormat: string = 'DD/MM/YYYY',
  ): { tasks: any[]; errors: any[] } {
    const tasks: any[] = [];
    const errors: any[] = [];

    rows.forEach((row, index) => {
      try {
        const task: any = {
          title: '',
          project: '',
          company: '',
          type: 'Feature',
          description: '',
          startTime: null,
          endTime: null,
        };

        let dateStr = '';
        let startTimeStr = '00:00';
        let endTimeStr = '';
        let endDateStr = '';
        let duration: number | null = null;

        template.forEach((mapping) => {
          let val = row[mapping.columnName];
          if (val === undefined || val === null) return;

          // Handle Excel Date objects
          if (val instanceof Date) {
            if (mapping.taskField === 'startDate' || mapping.taskField === 'endDate') {
              val = this.formatDate(val, excelDateFormat);
            } else if (mapping.taskField === 'startTime' || mapping.taskField === 'endTime') {
              const hours = val.getHours().toString().padStart(2, '0');
              const minutes = val.getMinutes().toString().padStart(2, '0');
              val = `${hours}:${minutes}`;
            }
          }

          switch (mapping.taskField) {
            case 'title':
              task.title = String(val);
              break;
            case 'project':
              task.project = String(val);
              break;
            case 'company':
              task.company = String(val);
              break;
            case 'type':
              task.type = String(val);
              break;
            case 'description':
              task.description = String(val);
              break;
            case 'startDate':
              dateStr = String(val);
              break;
            case 'startTime':
              startTimeStr = String(val);
              break;
            case 'endDate':
              endDateStr = String(val);
              break;
            case 'endTime':
              endTimeStr = String(val);
              break;
            case 'duration':
              duration = parseFloat(String(val));
              break;
          }
        });

        // Validation
        if (!task.title) {
          throw new Error('Title is required');
        }
        if (!dateStr) {
          throw new Error('Start date is required');
        }

        const parseDateWithFormat = (s: string, fmt: string): Date => {
          const yearIdx = fmt.indexOf('YYYY');
          const monthIdx = fmt.indexOf('MM');
          const dayIdx = fmt.indexOf('DD');

          if (yearIdx === -1 || monthIdx === -1 || dayIdx === -1) {
            throw new Error(`Invalid format configuration: ${fmt}`);
          }

          const year = parseInt(s.substring(yearIdx, yearIdx + 4));
          const month = parseInt(s.substring(monthIdx, monthIdx + 2)) - 1;
          const day = parseInt(s.substring(dayIdx, dayIdx + 2));

          if (isNaN(year) || isNaN(month) || isNaN(day)) {
            throw new Error(`Invalid start date: ${s}`);
          }

          const date = new Date(year, month, day);
          if (
            date.getFullYear() !== year ||
            date.getMonth() !== month ||
            date.getDate() !== day
          ) {
            throw new Error(`Invalid start date: ${s}`);
          }
          return date;
        };

        const startDateBase = parseDateWithFormat(dateStr, excelDateFormat);
        const [hours, minutes] = startTimeStr.split(':').map((v) => parseInt(v));
        task.startTime = new Date(startDateBase);
        task.startTime.setHours(hours || 0, minutes || 0, 0, 0);

        if (isNaN(task.startTime.getTime())) {
          throw new Error(`Invalid start date or time: ${dateStr} ${startTimeStr}`);
        }

        if (endTimeStr) {
          const endDateBase = endDateStr
            ? parseDateWithFormat(endDateStr, excelDateFormat)
            : startDateBase;
          const [eHours, eMinutes] = endTimeStr.split(':').map((v) => parseInt(v));
          task.endTime = new Date(endDateBase);
          task.endTime.setHours(eHours || 0, eMinutes || 0, 0, 0);

          if (isNaN(task.endTime.getTime())) {
            throw new Error(`Invalid end date or time: ${endDateStr || dateStr} ${endTimeStr}`);
          }
        } else if (duration !== null && !isNaN(duration)) {
          task.endTime = new Date(task.startTime.getTime() + duration * 3600000);
        } else {
          // Default to 1 hour if nothing else
          task.endTime = new Date(task.startTime.getTime() + 3600000);
        }

        if (task.endTime <= task.startTime) {
          throw new Error('End time must be after start time');
        }

        tasks.push(task);
      } catch (err: any) {
        errors.push({
          row: index, // 0-indexed row index
          message: err.message,
        });
      }
    });

    return { tasks, errors };
  }

  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }


  /**
   * Maps rows to tasks based on the provided template.
   * @deprecated Use processRows
   */
  private mapRowsToTasks(
    rows: any[],
    template: ColumnMapping[],
    excelDateFormat: string = 'DD/MM/YYYY',
  ): any[] {
    return this.processRows(rows, template, excelDateFormat).tasks;
  }

}
