<script lang="ts">
  import type { Task } from './db';
  import {
    calculateVerticalPosition,
    calculateHeight,
    getContrastColor,
  } from './utils';
  import { isBillable } from './config';
  import { i18n } from './i18n.svelte';

  interface TaskWithOverlap extends Task {
    hasOverlap?: boolean;
  }

  let {
    day,
    hours,
    pixelsPerMinute,
    tasks,
    taskTypeColors,
    locks,
    dragInfo,
    onSlotClick,
    onTaskClick,
    onTaskDelete,
    onPointerDown,
  }: {
    day: Date;
    hours: number[];
    pixelsPerMinute: number;
    tasks: TaskWithOverlap[];
    taskTypeColors: Record<string, string>;
    locks: { move: boolean; edit: boolean; create: boolean };
    dragInfo: any | null;
    onSlotClick?: (day: Date, hour: number) => void;
    onTaskClick?: (task: Task) => void;
    onTaskDelete?: (taskId: number) => void;
    onPointerDown?: (
      e: PointerEvent,
      task: Task,
      mode: 'move' | 'resize',
    ) => void;
  } = $props();

  function formatTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  function getTaskStyle(task: TaskWithOverlap): string {
    const start = task.startTime;
    const end = task.endTime;

    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const top = calculateVerticalPosition(start, pixelsPerMinute);
    const height = calculateHeight(durationMinutes, pixelsPerMinute);

    let style = `top: ${top}px; height: ${height}px;`;

    const customColor = taskTypeColors[task.type];
    if (customColor && !task.hasOverlap) {
      style += `background-color: ${customColor}; color: ${getContrastColor(customColor)}; border-color: rgba(0,0,0,0.1);`;
    }

    if (dragInfo && dragInfo.taskId === task.id) {
      style +=
        'z-index: 100; opacity: 0.8; box-shadow: 0 8px 16px rgba(0,0,0,0.2); cursor: grabbing !important;';
    }
    return style;
  }

  function getTaskDuration(task: Task): string {
    const durationMs = task.endTime.getTime() - task.startTime.getTime();
    return (durationMs / (1000 * 60 * 60)).toFixed(2) + 'h';
  }
</script>

<div class="day-column" style="--pixels-per-minute: {pixelsPerMinute}">
  {#each hours as hour}
    <div
      class="hour-cell"
      style="height: {60 * pixelsPerMinute}px"
      onclick={() => onSlotClick && onSlotClick(day, hour)}
      onkeydown={(e) =>
        e.key === 'Enter' && onSlotClick && onSlotClick(day, hour)}
      role="button"
      tabindex="0"
      aria-label={i18n.t('weekly.add_task_at', {
        time: formatTime(hour),
        date: day.toLocaleDateString(),
      })}
    ></div>
  {/each}
  {#each tasks as task (task.id)}
    <div
      class="task-block"
      class:has-overlap={task.hasOverlap}
      class:is-rest={!isBillable(task.type) &&
        task.type !== 'AUSENCIA FACTURABLE'}
      class:is-billable-absence={task.type === 'AUSENCIA FACTURABLE'}
      class:is-dragging={dragInfo?.taskId === task.id}
      style={getTaskStyle(task)}
      onpointerdown={(e) => onPointerDown && onPointerDown(e, task, 'move')}
      onclick={(e) => {
        e.stopPropagation();
        if (locks.edit) return;
        if (onTaskClick) onTaskClick(task);
      }}
      onkeydown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          if (locks.edit) return;
          if (onTaskClick) onTaskClick(task);
        }
      }}
      role="button"
      tabindex="0"
      aria-label={i18n.t('weekly.edit_task', { title: task.title })}
    >
      <button
        class="delete-btn"
        onclick={(e) => {
          e.stopPropagation();
          if (locks.edit) return;
          if (onTaskDelete && task.id !== undefined)
            onTaskDelete(task.id);
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
            if (locks.edit) return;
            if (onTaskDelete && task.id !== undefined)
              onTaskDelete(task.id);
          }
        }}
        title={i18n.t('common.delete')}
        aria-label={i18n.t('weekly.delete_task', { title: task.title })}
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="currentColor"
        >
          <path
            d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
          />
        </svg>
      </button>
      <div class="task-info">
        <span class="task-title">{task.title}</span>
        <span class="task-project">{task.project}</span>
        <span class="task-duration">{getTaskDuration(task)}</span>
      </div>
      <!-- Resize Handle -->
      <div
        class="resize-handle"
        onpointerdown={(e) => {
          if (!locks.move && onPointerDown) onPointerDown(e, task, 'resize');
        }}
        role="presentation"
      ></div>
    </div>
  {/each}
</div>

<style>
  /* Local border-box reset */
  .day-column,
  .day-column * {
    box-sizing: border-box;
  }

  .day-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--md-sys-color-outline-variant);
    min-width: 120px;
    position: relative;
  }

  .day-column:last-child {
    border-right: none;
  }

  .hour-cell {
    flex-shrink: 0;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
  }

  .task-block {
    position: absolute;
    left: 4px;
    right: 4px;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border-radius: 6px;
    padding: 2px 4px;
    font-size: 0.75rem;
    overflow: hidden;
    border: 1px solid var(--md-sys-color-primary);
    z-index: 1;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    line-height: 1.1;
    cursor: grab;
    user-select: none;
  }

  .task-block:active {
    cursor: grabbing;
  }

  .task-block.is-dragging {
    cursor: grabbing;
  }

  .task-block.is-rest {
    background-color: var(--md-sys-color-surface-variant);
    color: var(--md-sys-color-on-surface-variant);
    border-color: var(--md-sys-color-outline-variant);
    opacity: 0.8;
  }

  .task-block.is-billable-absence {
    background: repeating-linear-gradient(
      45deg,
      var(--md-sys-color-tertiary-container),
      var(--md-sys-color-tertiary-container) 10px,
      rgba(255, 255, 255, 0.3) 10px,
      rgba(255, 255, 255, 0.3) 20px
    );
    color: var(--md-sys-color-on-tertiary-container);
    border-color: var(--md-sys-color-tertiary);
  }

  .task-block.has-overlap {
    background-color: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
    border-color: var(--md-sys-color-error);
    opacity: 0.9;
    z-index: 2;
  }

  .task-info {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1px;
    padding-right: 16px; /* Space for delete button */
  }

  .delete-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    background: none;
    border: none;
    color: inherit;
    padding: 2px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    opacity: 0;
    transition:
      opacity 0.2s,
      background-color 0.2s;
    z-index: 10;
  }

  .task-block:hover .delete-btn {
    opacity: 0.7;
  }

  .delete-btn:hover {
    opacity: 1 !important;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .is-rest .delete-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .task-title {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-project {
    font-size: 0.65rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.85;
    font-weight: 500;
  }

  .task-title, .task-project {
    user-select: text;
  }

  .task-duration {
    font-size: 0.65rem;
    margin-top: auto;
    text-align: right;
    font-weight: 600;
    opacity: 0.7;
  }

  .resize-handle {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 12px;
    cursor: ns-resize;
    background: transparent;
    z-index: 5;
  }

  .resize-handle:hover {
    background: rgba(0, 0, 0, 0.1);
  }
</style>
