<script lang="ts">
  import type { Task } from './db';

  let {
    startDate = new Date(),
    tasks = [],
    onSlotClick,
    onTaskClick,
  }: {
    startDate: Date;
    tasks: Task[];
    onSlotClick?: (date: Date) => void;
    onTaskClick?: (task: Task) => void;
  } = $props();

  const daysOfWeek = $derived.by(() => {
    const days = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    // Find Monday of the current week if not provided
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  function formatDay(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  function formatTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  function getDailyTotal(date: Date): string {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dailyTasks = tasks
      .filter((t) => t.startTime >= dayStart && t.startTime <= dayEnd)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    if (dailyTasks.length === 0) return '0.00';

    // Merge overlapping intervals to calculate unique time covered
    const mergedIntervals: { start: Date; end: Date }[] = [];
    let currentInterval = {
      start: new Date(dailyTasks[0].startTime),
      end: new Date(dailyTasks[0].endTime),
    };

    for (let i = 1; i < dailyTasks.length; i++) {
      const nextTask = dailyTasks[i];
      if (nextTask.startTime < currentInterval.end) {
        // Overlap detected, extend the end time if necessary
        if (nextTask.endTime > currentInterval.end) {
          currentInterval.end = new Date(nextTask.endTime);
        }
      } else {
        // No overlap, push current and start new
        mergedIntervals.push(currentInterval);
        currentInterval = {
          start: new Date(nextTask.startTime),
          end: new Date(nextTask.endTime),
        };
      }
    }
    mergedIntervals.push(currentInterval);

    const totalMs = mergedIntervals.reduce((acc, interval) => {
      return acc + (interval.end.getTime() - interval.start.getTime());
    }, 0);

    return (totalMs / (1000 * 60 * 60)).toFixed(2);
  }

  interface TaskWithOverlap extends Task {
    hasOverlap?: boolean;
  }

  function getTasksForDay(date: Date): TaskWithOverlap[] {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dailyTasks: TaskWithOverlap[] = tasks
      .filter((t) => t.startTime >= dayStart && t.startTime <= dayEnd)
      .map((t) => ({ ...t }));

    // Detect overlaps
    for (let i = 0; i < dailyTasks.length; i++) {
      for (let j = i + 1; j < dailyTasks.length; j++) {
        const t1 = dailyTasks[i];
        const t2 = dailyTasks[j];

        // Check if t1 and t2 overlap
        if (t1.startTime < t2.endTime && t2.startTime < t1.endTime) {
          t1.hasOverlap = true;
          t2.hasOverlap = true;
        }
      }
    }

    return dailyTasks;
  }

  function getTaskStyle(task: Task): string {
    const start = task.startTime;
    const end = task.endTime;

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const top = startMinutes; // 1px per minute since hour height is 60px
    const height = Math.max(durationMinutes, 20); // Min height for visibility

    return `top: ${top}px; height: ${height}px;`;
  }

  function getTaskDuration(task: Task): string {
    const durationMs = task.endTime.getTime() - task.startTime.getTime();
    return (durationMs / (1000 * 60 * 60)).toFixed(2) + 'h';
  }

  function handleSlotClick(day: Date, hour: number) {
    if (onSlotClick) {
      const clickedDate = new Date(day);
      clickedDate.setHours(hour, 0, 0, 0);
      onSlotClick(clickedDate);
    }
  }
</script>

<div class="weekly-view">
  <div class="grid-header">
    <div class="time-axis-spacer"></div>
    {#each daysOfWeek as day}
      <div class="day-header">
        <span class="day-name">{formatDay(day)}</span>
        <span class="day-date">{day.toLocaleDateString()}</span>
        <span class="day-total">Total: {getDailyTotal(day)}h</span>
      </div>
    {/each}
  </div>

  <div class="grid-body">
    <div class="time-axis">
      {#each hours as hour}
        <div class="hour-label">{formatTime(hour)}</div>
      {/each}
    </div>

    <div class="grid-content">
      {#each daysOfWeek as day}
        <div class="day-column">
          {#each hours as hour}
            <div
              class="hour-cell"
              onclick={() => handleSlotClick(day, hour)}
              onkeydown={(e) => e.key === 'Enter' && handleSlotClick(day, hour)}
              role="button"
              tabindex="0"
              aria-label="Add task at {formatTime(hour)} on {day.toLocaleDateString()}"
            ></div>
          {/each}
          {#each getTasksForDay(day) as task (task.id)}
            <div
              class="task-block"
              class:has-overlap={task.hasOverlap}
              style={getTaskStyle(task)}
              onclick={(e) => {
                e.stopPropagation();
                if (onTaskClick) onTaskClick(task);
              }}
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  if (onTaskClick) onTaskClick(task);
                }
              }}
              role="button"
              tabindex="0"
              aria-label="Edit task: {task.title}"
            >
              <div class="task-info">
                <span class="task-title">{task.title}</span>
                <span class="task-project">{task.project}</span>
                <span class="task-duration">{getTaskDuration(task)}</span>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .weekly-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--md-sys-color-surface);
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 12px;
    overflow: hidden;
  }

  .grid-header {
    display: flex;
    border-bottom: 1px solid var(--md-sys-color-outline);
    background-color: var(--md-sys-color-surface-variant);
  }

  .time-axis-spacer {
    width: 60px;
    flex-shrink: 0;
    border-right: 1px solid var(--md-sys-color-outline);
  }

  .day-header {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    border-right: 1px solid var(--md-sys-color-outline);
    min-width: 120px;
  }

  .day-header:last-child {
    border-right: none;
  }

  .day-name {
    font-weight: bold;
    font-size: 0.9rem;
  }

  .day-date {
    font-size: 0.8rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .day-total {
    margin-top: 0.25rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--md-sys-color-primary);
  }

  .grid-body {
    display: flex;
    flex: 1;
    overflow-y: auto;
  }

  .time-axis {
    width: 60px;
    flex-shrink: 0;
    border-right: 1px solid var(--md-sys-color-outline);
    background-color: var(--md-sys-color-surface-variant);
  }

  .hour-label {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
    border-bottom: 1px solid var(--md-sys-color-surface-variant);
  }

  .grid-content {
    display: flex;
    flex: 1;
  }

  .day-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--md-sys-color-outline);
    min-width: 120px;
    position: relative;
  }

  .day-column:last-child {
    border-right: none;
  }

  .hour-cell {
    height: 60px;
    border-bottom: 1px solid var(--md-sys-color-surface-variant);
    cursor: pointer;
  }

  .hour-cell:hover {
    background-color: var(--md-sys-color-surface-variant);
  }

  .hour-cell:last-child {
    border-bottom: none;
  }

  .task-block {
    position: absolute;
    left: 2px;
    right: 2px;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 0.75rem;
    overflow: hidden;
    border: 1px solid var(--md-sys-color-primary);
    z-index: 1;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s;
  }

  .task-block.has-overlap {
    background-color: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
    border-color: var(--md-sys-color-error);
    z-index: 2;
  }

  .task-info {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .task-title {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-project {
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.8;
  }

  .task-duration {
    font-size: 0.65rem;
    margin-top: auto;
    text-align: right;
  }
</style>
