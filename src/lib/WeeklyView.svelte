<script lang="ts">
  import type { Task } from './db';
  import { calculateTotalHours } from './utils';
  import { isBillable } from './config';

  let {
    startDate = new Date(),
    tasks = [],
    weeklyTarget = 41,
    onSlotClick,
    onTaskClick,
    onTaskUpdate,
    onTaskDelete,
    onTaskCopyToRecents,
    onNavigate,
    onDayClick,
  }: {
    startDate: Date;
    tasks: Task[];
    weeklyTarget?: number;
    onSlotClick?: (date: Date) => void;
    onDayClick?: (date: Date) => void;
    onTaskClick?: (task: Task) => void;
    onTaskUpdate?: (task: Task) => void;
    onTaskDelete?: (taskId: number) => void;
    onTaskCopyToRecents?: (task: Task) => void;
    onNavigate?: (date: Date) => void;
  } = $props();

  const daysOfWeek = $derived.by(() => {
    const days = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
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

  // Drag and Drop State
  interface DragInfo {
    taskId: number | string;
    mode: 'move' | 'resize';
    startY: number;
    startX: number;
    initialStart: number; // minutes from midnight
    initialDuration: number; // minutes
    initialDayIndex: number;
    currentTask: Task;
  }

  let dragInfo = $state<DragInfo | null>(null);
  let gridContentRef = $state<HTMLElement | null>(null);

  // Long Press State
  let longPressTimer = $state<number | null>(null);
  const LONG_PRESS_THRESHOLD = 500; // ms

  // Merge State
  let mergeProposal = $state<{
    task1: Task;
    task2: Task;
    movedTask: Task; // Keep track of the actual moved task
  } | null>(null);

  // Snap State
  let snapProposal = $state<{
    task: Task;
    snapTo: 'before' | 'after';
    targetTime: Date;
  } | null>(null);

  function formatDay(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  function formatTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  function handleLongPress(task: Task) {
    if (onTaskCopyToRecents) {
      onTaskCopyToRecents(task);
      // Feedback visual
      const taskEl = document.querySelector(`[aria-label="Edit task: ${task.title}"]`);
      if (taskEl) {
        taskEl.classList.add('copied-feedback');
        setTimeout(() => taskEl.classList.remove('copied-feedback'), 1000);
      }
    }
  }

  function getIntervalTotal(dailyTasks: Task[]): string {
    if (dailyTasks.length === 0) return '0.00';

    const mergedIntervals: { start: Date; end: Date }[] = [];
    let currentInterval = {
      start: new Date(dailyTasks[0].startTime),
      end: new Date(dailyTasks[0].endTime),
    };

    for (let i = 1; i < dailyTasks.length; i++) {
      const nextTask = dailyTasks[i];
      if (nextTask.startTime < currentInterval.end) {
        if (nextTask.endTime > currentInterval.end) {
          currentInterval.end = new Date(nextTask.endTime);
        }
      } else {
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

  function getDailyTotal(date: Date): string {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const effectiveTasks = dragInfo
      ? tasks.map((t) => (t.id === dragInfo?.taskId ? dragInfo.currentTask : t))
      : tasks;

    const dailyTasks = effectiveTasks
      .filter((t) => t.startTime >= dayStart && t.startTime <= dayEnd)
      .filter((t) => isBillable(t.type))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return getIntervalTotal(dailyTasks);
  }

  function getDailyRestTotal(date: Date): string {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const effectiveTasks = dragInfo
      ? tasks.map((t) => (t.id === dragInfo?.taskId ? dragInfo.currentTask : t))
      : tasks;

    const dailyTasks = effectiveTasks
      .filter((t) => t.startTime >= dayStart && t.startTime <= dayEnd)
      .filter((t) => !isBillable(t.type))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return getIntervalTotal(dailyTasks);
  }

  interface TaskWithOverlap extends Task {
    hasOverlap?: boolean;
  }

  function getTasksForDay(date: Date): TaskWithOverlap[] {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const effectiveTasks = dragInfo
      ? tasks.map((t) => (t.id === dragInfo?.taskId ? dragInfo.currentTask : t))
      : tasks;

    const dailyTasks: TaskWithOverlap[] = effectiveTasks
      .filter((t) => t.startTime >= dayStart && t.startTime <= dayEnd)
      .map((t) => ({ ...t, hasOverlap: false }));

    // Detect overlaps
    for (let i = 0; i < dailyTasks.length; i++) {
      for (let j = i + 1; j < dailyTasks.length; j++) {
        const t1 = dailyTasks[i];
        const t2 = dailyTasks[j];
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

    const top = startMinutes;
    const height = durationMinutes;

    let style = `top: ${top}px; height: ${height}px;`;
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

  function checkForMerge(updatedTask: Task) {
    // Look for adjacent tasks on the same day with same project and type
    const dayStart = new Date(updatedTask.startTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(updatedTask.startTime);
    dayEnd.setHours(23, 59, 59, 999);

    const dailyTasks = tasks
      .filter((t) => t.id !== updatedTask.id) // Exclude the task itself
      .filter((t) => t.startTime >= dayStart && t.startTime <= dayEnd)
      .filter(
        (t) =>
          t.project === updatedTask.project &&
          t.type === updatedTask.type &&
          t.title === updatedTask.title,
      );

    // Case 1: updatedTask ends when another task starts
    const taskAfter = dailyTasks.find(
      (t) =>
        Math.abs(t.startTime.getTime() - updatedTask.endTime.getTime()) < 60000,
    );
    if (taskAfter) {
      mergeProposal = { task1: updatedTask, task2: taskAfter, movedTask: updatedTask };
      return true;
    }

    // Case 2: another task ends when updatedTask starts
    const taskBefore = dailyTasks.find(
      (t) =>
        Math.abs(updatedTask.startTime.getTime() - t.endTime.getTime()) < 60000,
    );
    if (taskBefore) {
      mergeProposal = { task1: taskBefore, task2: updatedTask, movedTask: updatedTask };
      return true;
    }

    return false;
  }

  function checkForSnap(updatedTask: Task) {
    const dayStart = new Date(updatedTask.startTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(updatedTask.startTime);
    dayEnd.setHours(23, 59, 59, 999);

    const dailyTasks = tasks
      .filter((t) => t.id !== updatedTask.id)
      .filter((t) => t.startTime >= dayStart && t.startTime <= dayEnd)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Check for gap with task before
    const taskBefore = [...dailyTasks]
      .reverse()
      .find((t) => t.endTime <= updatedTask.startTime);
    if (taskBefore) {
      const gapMs = updatedTask.startTime.getTime() - taskBefore.endTime.getTime();
      if (gapMs > 0 && gapMs <= 15 * 60000) {
        snapProposal = {
          task: updatedTask,
          snapTo: 'before',
          targetTime: new Date(taskBefore.endTime),
        };
        return true;
      }
    }

    // Check for gap with task after
    const taskAfter = dailyTasks.find((t) => t.startTime >= updatedTask.endTime);
    if (taskAfter) {
      const gapMs = taskAfter.startTime.getTime() - updatedTask.endTime.getTime();
      if (gapMs > 0 && gapMs <= 15 * 60000) {
        snapProposal = {
          task: updatedTask,
          snapTo: 'after',
          targetTime: new Date(taskAfter.startTime),
        };
        return true;
      }
    }

    return false;
  }

  function handleSnap() {
    if (!snapProposal || !onTaskUpdate) return;

    const { task, snapTo, targetTime } = snapProposal;
    const durationMs = task.endTime.getTime() - task.startTime.getTime();

    const updatedTask = { ...task };
    if (snapTo === 'before') {
      updatedTask.startTime = new Date(targetTime);
      updatedTask.endTime = new Date(targetTime.getTime() + durationMs);
    } else {
      updatedTask.endTime = new Date(targetTime);
      updatedTask.startTime = new Date(targetTime.getTime() - durationMs);
    }

    onTaskUpdate(updatedTask);
    snapProposal = null;
  }

  function handleMerge() {
    if (!mergeProposal || !onTaskDelete || !onTaskUpdate) return;

    const { task1, task2 } = mergeProposal;

    // Combine into task1
    const mergedTask = {
      ...task1,
      startTime: new Date(Math.min(task1.startTime.getTime(), task2.startTime.getTime())),
      endTime: new Date(Math.max(task1.endTime.getTime(), task2.endTime.getTime())),
    };

    // Update task1 and delete task2
    if (task2.id !== undefined) {
      onTaskDelete(task2.id);
    }
    onTaskUpdate(mergedTask);

    mergeProposal = null;
  }

  function handleSlotClick(day: Date, hour: number) {
    if (onSlotClick) {
      const clickedDate = new Date(day);
      clickedDate.setHours(hour, 0, 0, 0);
      onSlotClick(clickedDate);
    }
  }

  function handlePointerDown(
    e: PointerEvent,
    task: Task,
    mode: 'move' | 'resize',
  ) {
    if (e.button !== 0) return; // Left click only
    e.stopPropagation();

    if (mode === 'move') {
      longPressTimer = window.setTimeout(() => {
        handleLongPress(task);
        longPressTimer = null;
      }, LONG_PRESS_THRESHOLD);
    }

    const startMinutes =
      task.startTime.getHours() * 60 + task.startTime.getMinutes();

    const durationMinutes =
      (task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60);

    const dayStart = new Date(task.startTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayIndex = daysOfWeek.findIndex(
      (d) => d.getTime() === dayStart.getTime(),
    );

    dragInfo = {
      taskId: task.id!,
      mode,
      startY: e.clientY,
      startX: e.clientX,
      initialStart: startMinutes,
      initialDuration: durationMinutes,
      initialDayIndex: dayIndex,
      currentTask: { ...task },
    };
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragInfo) return;

    const deltaY = e.clientY - dragInfo.startY;
    const deltaX = e.clientX - dragInfo.startX;

    // If moved more than 5px, cancel long press
    if (longPressTimer && (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5)) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    const minutesDelta = Math.round(deltaY / 15) * 15;

    const updatedTask = { ...dragInfo.currentTask };

    if (dragInfo.mode === 'move') {
      const newStartMinutes = Math.max(
        0,
        Math.min(23 * 60, dragInfo.initialStart + minutesDelta),
      );
      const duration = dragInfo.initialDuration;

      if (gridContentRef) {
        const rect = gridContentRef.getBoundingClientRect();
        const colWidth = rect.width / 7;
        const deltaX = e.clientX - dragInfo.startX;
        const dayDelta = Math.round(deltaX / colWidth);
        let newDayIndex = dragInfo.initialDayIndex + dayDelta;
        newDayIndex = Math.max(0, Math.min(6, newDayIndex));

        const newDay = new Date(daysOfWeek[newDayIndex]);

        updatedTask.startTime = new Date(newDay);
        updatedTask.startTime.setHours(
          Math.floor(newStartMinutes / 60),
          newStartMinutes % 60,
          0,
          0,
        );

        updatedTask.endTime = new Date(
          updatedTask.startTime.getTime() + duration * 60000,
        );
      }
    } else if (dragInfo.mode === 'resize') {
      const newDuration = Math.max(15, dragInfo.initialDuration + minutesDelta);
      updatedTask.endTime = new Date(
        updatedTask.startTime.getTime() + newDuration * 60000,
      );

      // Limit to end of day
      const dayEnd = new Date(updatedTask.startTime);
      dayEnd.setHours(23, 59, 59, 999);
      if (updatedTask.endTime > dayEnd) {
        updatedTask.endTime = dayEnd;
      }
    }

    dragInfo.currentTask = updatedTask;
  }

  function handlePointerUp() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (!dragInfo) return;

    if (onTaskUpdate && dragInfo.currentTask) {
      const original = tasks.find((t) => t.id === dragInfo?.taskId);
      if (
        original &&
        (original.startTime.getTime() !==
          dragInfo.currentTask.startTime.getTime() ||
          original.endTime.getTime() !== dragInfo.currentTask.endTime.getTime())
      ) {
        // Check for merge BEFORE calling onTaskUpdate if it is a move or resize
        if (!checkForMerge(dragInfo.currentTask)) {
          if (!checkForSnap(dragInfo.currentTask)) {
            onTaskUpdate(dragInfo.currentTask);
          }
        }
      }
    }

    dragInfo = null;
  }
</script>

<svelte:window
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
/>

<div class="weekly-view">
  <div class="weekly-header">
    <div class="nav-controls">
      <button
        class="nav-btn"
        onclick={() => {
          const prev = new Date(startDate);
          prev.setDate(prev.getDate() - 7);
          if (onNavigate) onNavigate(prev);
        }}
        title="Previous Week"
        aria-label="Previous Week"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
        </svg>
      </button>
      <button
        class="nav-btn"
        onclick={() => {
          const next = new Date(startDate);
          next.setDate(next.getDate() + 7);
          if (onNavigate) onNavigate(next);
        }}
        title="Next Week"
        aria-label="Next Week"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
        </svg>
      </button>
    </div>
    <div class="weekly-summary">
      Logged: {calculateTotalHours(tasks).toFixed(2)}h / Target: {weeklyTarget}h
    </div>
  </div>
  <div class="grid-scroll-container">
    <div class="grid-header">
      <div class="time-axis-spacer"></div>
      {#each daysOfWeek as day}
        <div
          class="day-header"
          onclick={() => onDayClick && onDayClick(day)}
          onkeydown={(e) => e.key === 'Enter' && onDayClick && onDayClick(day)}
          role="button"
          tabindex="0"
          aria-label="View daily details for {formatDay(day)}"
        >
          <span class="day-name">{formatDay(day)}</span>
          <span class="day-date">{day.toLocaleDateString()}</span>
          <div class="totals">
            <span class="day-total" title="Billable Hours">
              {getDailyTotal(day)}h
            </span>
            <span class="day-total-rest" title="Rest/Non-billable Hours">
              {getDailyRestTotal(day)}h
            </span>
          </div>
        </div>
      {/each}
    </div>

    <div class="grid-body">
      <div class="time-axis">
        {#each hours as hour}
          <div class="hour-label">
            <span>{formatTime(hour)}</span>
          </div>
        {/each}
      </div>

      <div class="grid-content" bind:this={gridContentRef}>
        {#each daysOfWeek as day}
          <div class="day-column">
            {#each hours as hour}
              <div
                class="hour-cell"
                onclick={() => handleSlotClick(day, hour)}
                onkeydown={(e) =>
                  e.key === 'Enter' && handleSlotClick(day, hour)}
                role="button"
                tabindex="0"
                aria-label="Add task at {formatTime(
                  hour,
                )} on {day.toLocaleDateString()}"
              ></div>
            {/each}
            {#each getTasksForDay(day) as task (task.id)}
              <div
                class="task-block"
                class:has-overlap={task.hasOverlap}
                class:is-rest={!isBillable(task.type)}
                class:is-dragging={dragInfo?.taskId === task.id}
                style={getTaskStyle(task)}
                onpointerdown={(e) => handlePointerDown(e, task, 'move')}
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
                <button
                  class="delete-btn"
                  onclick={(e) => {
                    e.stopPropagation();
                    if (onTaskDelete && task.id !== undefined)
                      onTaskDelete(task.id);
                  }}
                  onkeydown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      if (onTaskDelete && task.id !== undefined)
                        onTaskDelete(task.id);
                    }
                  }}
                  title="Delete Task"
                  aria-label="Delete task: {task.title}"
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
                  onpointerdown={(e) => handlePointerDown(e, task, 'resize')}
                  role="presentation"
                ></div>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

{#if mergeProposal}
  <div class="merge-modal-backdrop" onclick={() => (mergeProposal = null)} role="presentation">
    <div class="merge-modal" onclick={(e) => e.stopPropagation()} role="presentation">
      <h3>Merge identical tasks?</h3>
      <p>
        These tasks are consecutive and identical. Would you like to merge them into a single record?
      </p>
      <div class="merge-details">
        <div>
          <strong>{mergeProposal.task1.title}</strong> ({mergeProposal.task1.project})
        </div>
        <div>
          {mergeProposal.task1.startTime.toLocaleTimeString()} - {mergeProposal.task2.endTime.toLocaleTimeString()}
        </div>
      </div>
      <div class="merge-actions">
        <button class="btn-cancel" onclick={() => {
          if (mergeProposal && onTaskUpdate) {
            onTaskUpdate(mergeProposal.movedTask);
          }
          mergeProposal = null;
        }}>No</button>
        <button class="btn-confirm" onclick={handleMerge}>Yes, Merge</button>
      </div>
    </div>
  </div>
{/if}

{#if snapProposal}
  <div class="merge-modal-backdrop" onclick={() => (snapProposal = null)} role="presentation">
    <div class="merge-modal" onclick={(e) => e.stopPropagation()} role="presentation">
      <h3>Close the gap?</h3>
      <p>
        There is a small gap between this task and the {snapProposal.snapTo === 'before' ? 'previous' : 'next'} one. 
        Would you like to snap them together?
      </p>
      <div class="merge-actions">
        <button class="btn-cancel" onclick={() => {
          if (snapProposal && onTaskUpdate) {
            onTaskUpdate(snapProposal.task);
          }
          snapProposal = null;
        }}>No</button>
        <button class="btn-confirm" onclick={handleSnap}>Yes, Snap</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .merge-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .merge-modal {
    background: white; /* Fallback */
    background: var(--md-sys-color-surface);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 2px solid var(--md-sys-color-primary);
  }

  .merge-modal h3 {
    margin: 0;
    color: var(--md-sys-color-primary);
  }

  .merge-modal p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--md-sys-color-on-surface);
  }

  .merge-details {
    background: var(--md-sys-color-surface-variant);
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
    border: 1px dashed var(--md-sys-color-outline);
  }

  .merge-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .btn-cancel,
  .btn-confirm {
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s;
  }

  .btn-cancel {
    background: var(--md-sys-color-surface-variant);
    color: var(--md-sys-color-on-surface-variant);
  }

  .btn-confirm {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }

  .btn-cancel:hover,
  .btn-confirm:hover {
    opacity: 0.8;
  }

  .weekly-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--md-sys-color-surface);
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 12px;
    overflow: hidden;
    touch-action: none;
  }

  .weekly-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--md-sys-color-primary-container);
    border-bottom: 1px solid var(--md-sys-color-outline);
    padding: 0 0.5rem;
  }

  .nav-controls {
    display: flex;
    gap: 4px;
  }

  .nav-btn {
    background: none;
    border: none;
    color: var(--md-sys-color-on-primary-container);
    padding: 4px;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .nav-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .weekly-summary {
    color: var(--md-sys-color-on-primary-container);
    padding: 0.5rem 0.5rem;
    font-weight: 600;
    flex: 1;
    text-align: center;
  }

  /* Local border-box reset */
  .weekly-view,
  .weekly-view * {
    box-sizing: border-box;
  }

  .grid-scroll-container {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .grid-header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 20;
    background-color: var(--md-sys-color-surface-variant);
    border-bottom: 1px solid var(--md-sys-color-outline);
    flex-shrink: 0;
    min-width: max-content;
  }

  .time-axis-spacer {
    width: 64px;
    flex-shrink: 0;
    border-right: 1px solid var(--md-sys-color-outline-variant);
    position: sticky;
    left: 0;
    z-index: 25;
    background-color: var(--md-sys-color-surface-variant);
  }

  .day-header {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-right: 1px solid var(--md-sys-color-outline-variant);
    min-width: 120px;
    cursor: pointer;
    transition: background-color 0.2s;
    user-select: none;
  }

  .day-header:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .day-header:active {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .day-header:last-child {
    border-right: none;
  }

  .day-name {
    font-weight: bold;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .day-date {
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
    margin-top: 2px;
  }

  .totals {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
    align-items: center;
  }

  .day-total {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--md-sys-color-primary);
    background-color: var(--md-sys-color-primary-container);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .day-total-rest {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
    background-color: var(--md-sys-color-surface-variant);
    padding: 2px 6px;
    border-radius: 10px;
    opacity: 0.8;
  }

  .grid-body {
    display: flex;
    flex: 1;
    position: relative;
    min-height: min-content;
    min-width: max-content;
  }

  .time-axis {
    width: 64px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background-color: var(--md-sys-color-surface-variant);
    border-right: 1px solid var(--md-sys-color-outline-variant);
    min-height: 1440px;
    position: sticky;
    left: 0;
    z-index: 10;
  }

  .hour-label {
    height: 60px;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding-right: 8px;
    padding-top: 4px;
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
  }

  .grid-content {
    display: flex;
    flex: 1;
    min-height: 1440px; /* 24 * 60px */
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
    height: 60px;
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

  .task-block.has-overlap {
    background-color: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
    border-color: var(--md-sys-color-error);
    opacity: 0.9;
    z-index: 2;
  }

  .task-block.copied-feedback {
    animation: copied-pulse 1s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
  }

  @keyframes copied-pulse {
    0% {
      transform: scale(1);
      background-color: var(--md-sys-color-primary-container);
      box-shadow: 0 0 0 0 var(--md-sys-color-primary);
    }
    20% {
      transform: scale(1.02);
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      box-shadow: 0 0 10px 4px var(--md-sys-color-primary-fixed-dim);
    }
    100% {
      transform: scale(1);
      background-color: var(--md-sys-color-primary-container);
      box-shadow: 0 0 0 0 transparent;
    }
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
