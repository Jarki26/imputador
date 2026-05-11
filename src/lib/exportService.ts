import * as XLSX from 'xlsx';
import type { Task } from './db';
import type { ColumnMapping } from './exportConfigStore';
import { i18n } from './i18n.svelte';

/**
 * Service to handle Excel export logic.
 */
export class ExportService {
  /**
   * Generates an Excel file (XLSX) from the provided tasks and template.
   * Returns a Blob that can be used for download.
   */
  async generateExcel(
    tasks: Task[],
    template: ColumnMapping[],
    excelDateFormat: string = 'YYYY-MM-DD',
    excelSheetName: string = 'Tasks',
  ): Promise<Blob> {
    const rows = this.mapTasksToRows(tasks, template, excelDateFormat);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, excelSheetName);

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  /**
   * Formats a filename based on a pattern and a date range.
   */
  formatFilename(pattern: string, startDate: Date, endDate: Date): string {
    let result = pattern;
    const tokens = {
      '{START_YYYY}': startDate.getFullYear().toString(),
      '{START_MM}': (startDate.getMonth() + 1).toString().padStart(2, '0'),
      '{START_DD}': startDate.getDate().toString().padStart(2, '0'),
      '{END_YYYY}': endDate.getFullYear().toString(),
      '{END_MM}': (endDate.getMonth() + 1).toString().padStart(2, '0'),
      '{END_DD}': endDate.getDate().toString().padStart(2, '0'),
    };

    Object.entries(tokens).forEach(([token, value]) => {
      result = result.split(token).join(value);
    });

    return result + '.xlsx';
  }

  /**
   * Maps a list of tasks to a list of row objects based on the template.
   */
  private mapTasksToRows(
    tasks: Task[],
    template: ColumnMapping[],
    excelDateFormat: string,
  ): any[] {
    return tasks.map((task) => {
      const row: any = {};
      template.forEach((mapping) => {
        if (mapping.fixedValue !== undefined) {
          row[mapping.columnName] = mapping.fixedValue;
        } else if (mapping.taskField) {
          row[mapping.columnName] = this.getFieldValue(
            task,
            mapping.taskField,
            excelDateFormat,
          );
        }
      });
      return row;
    });
  }

  /**
   * Extracts and formats a specific field from a task.
   */
  private getFieldValue(
    task: Task,
    field: string,
    excelDateFormat: string,
  ): string {
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);

    switch (field) {
      case 'startDate':
        return this.formatDate(start, excelDateFormat);
      case 'startTime':
        return this.formatTime(start);
      case 'endDate':
        return this.formatDate(end, excelDateFormat);
      case 'endTime':
        return this.formatTime(end);
      case 'title':
        return task.title;
      case 'project':
        return task.project;
      case 'company':
        return task.company || '';
      case 'type':
        const i18nKey = `task.type_${task.type.toLowerCase().replace(/\s+/g, '_')}`;
        const translatedType = i18n.t(i18nKey);
        return translatedType === i18nKey ? task.type : translatedType;
      case 'description':
        return task.description;
      case 'duration':
        const diffMs = end.getTime() - start.getTime();
        return (diffMs / (1000 * 60 * 60)).toFixed(2);
      default:
        return '';
    }
  }

  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return format.replace('YYYY', year).replace('MM', month).replace('DD', day);
  }

  private formatTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
