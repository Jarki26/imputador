<script lang="ts">
  import type { Task } from './db';

  let { startDate = new Date(), tasks = [] }: { startDate: Date; tasks: Task[] } = $props();

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

    const dailyTasks = tasks.filter(
      (t) => t.startTime >= dayStart && t.startTime <= dayEnd,
    );

    const totalMs = dailyTasks.reduce((acc, t) => {
      return acc + (t.endTime.getTime() - t.startTime.getTime());
    }, 0);

    return (totalMs / (1000 * 60 * 60)).toFixed(2);
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
            <div class="hour-cell"></div>
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
  }

  .hour-cell:last-child {
    border-bottom: none;
  }
</style>
