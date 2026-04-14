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
  async parseFile(file: File, template: ColumnMapping[]): Promise<{ tasks: any[]; errors: any[] }> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    return this.processRows(rows, template);
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
  private processRows(rows: any[], template: ColumnMapping[]): { tasks: any[]; errors: any[] } {
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
            const year = val.getFullYear();
            const month = (val.getMonth() + 1).toString().padStart(2, '0');
            const day = val.getDate().toString().padStart(2, '0');
            const hours = val.getHours().toString().padStart(2, '0');
            const minutes = val.getMinutes().toString().padStart(2, '0');
            
            if (mapping.taskField === 'startDate' || mapping.taskField === 'endDate') {
              val = `${year}-${month}-${day}`;
            } else if (mapping.taskField === 'startTime' || mapping.taskField === 'endTime') {
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

        // Clean date strings (sometimes they come with extra spaces or different separators)
        const cleanDate = (s: string) => s.replace(/\//g, '-').trim();
        const finalDateStr = cleanDate(dateStr);
        const finalStartTimeStr = startTimeStr.trim();

        task.startTime = new Date(`${finalDateStr}T${finalStartTimeStr}`);
        if (isNaN(task.startTime.getTime())) {
          // Try parsing without T if it fails
          task.startTime = new Date(`${finalDateStr} ${finalStartTimeStr}`);
          if (isNaN(task.startTime.getTime())) {
            throw new Error(`Invalid start date or time: ${dateStr} ${startTimeStr}`);
          }
        }

        if (endTimeStr) {
          const cleanEndDateStr = endDateStr ? cleanDate(endDateStr) : finalDateStr;
          const cleanEndTimeStr = endTimeStr.trim();
          task.endTime = new Date(`${cleanEndDateStr}T${cleanEndTimeStr}`);
          if (isNaN(task.endTime.getTime())) {
            task.endTime = new Date(`${cleanEndDateStr} ${cleanEndTimeStr}`);
            if (isNaN(task.endTime.getTime())) {
              throw new Error(`Invalid end date or time: ${cleanEndDateStr} ${endTimeStr}`);
            }
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

  /**
   * Maps rows to tasks based on the provided template.
   * @deprecated Use processRows
   */
  private mapRowsToTasks(rows: any[], template: ColumnMapping[]): any[] {
    return this.processRows(rows, template).tasks;
  }
}
