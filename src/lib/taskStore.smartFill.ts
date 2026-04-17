import type { Task } from './db';

/**
 * Automatically distributes a total duration across available empty slots starting from a given date.
 */
export async function addWithSmartFill(
  taskData: Omit<Task, 'startTime' | 'endTime'>,
  startDate: Date,
  totalDurationMs: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTasksForDay: (date: Date) => Promise<Task[]>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTask: (task: Task) => Promise<number | undefined>,
): Promise<void> {
  let remaining = totalDurationMs;
  const current = new Date(startDate);
  // Keep the time if it's the first day, but for subsequent days we'll start at 00:00
  let isFirstDay = true;

  while (remaining > 0) {
    const dayTasks = (await getTasksForDay(current)).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    const gaps: { start: Date; end: Date }[] = [];
    let lastEnd = new Date(current);
    if (isFirstDay) {
      // lastEnd is already startDate (including time)
    } else {
      lastEnd.setHours(0, 0, 0, 0);
    }

    for (const task of dayTasks) {
      // Skip tasks that end before our starting point
      if (task.endTime <= lastEnd) continue;

      const effectiveStart =
        task.startTime < lastEnd ? lastEnd : task.startTime;

      if (effectiveStart > lastEnd) {
        gaps.push({
          start: new Date(lastEnd),
          end: new Date(effectiveStart),
        });
      }
      if (task.endTime > lastEnd) {
        lastEnd = new Date(task.endTime);
      }
    }

    const dayEnd = new Date(current);
    dayEnd.setHours(24, 0, 0, 0);
    if (lastEnd < dayEnd) {
      gaps.push({ start: new Date(lastEnd), end: dayEnd });
    }

    for (const gap of gaps) {
      const gapDuration = gap.end.getTime() - gap.start.getTime();
      const fillDuration = Math.min(gapDuration, remaining);

      if (fillDuration > 0) {
        await addTask({
          ...taskData,
          startTime: new Date(gap.start),
          endTime: new Date(gap.start.getTime() + fillDuration),
        } as Task);
        remaining -= fillDuration;
      }

      if (remaining <= 0) break;
    }

    if (remaining > 0) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      isFirstDay = false;
      // Safety break to prevent infinite loops (e.g., if we go too far in the future)
      if (current.getFullYear() > startDate.getFullYear() + 1) break;
    }
  }
}
