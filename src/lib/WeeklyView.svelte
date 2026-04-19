<script lang="ts">
  import type { Task } from './db';
  import {
    calculateWorkHours,
    calculateGoalAbsenceHours,
    calculateRestHours,
  } from './taskUtils';
  import { isBillable } from './config';
  import { i18n } from './i18n.svelte';
  import WeeklyHeader from './WeeklyHeader.svelte';
  import WeeklyColumn from './WeeklyColumn.svelte';

  let {
    startDate = new Date(),
    tasks = [],
    weeklyTarget = 41,
    taskTypeColors = {},
    onSlotClick,
    onTaskClick,
    onTaskUpdate,
    onTaskDelete,
    onTaskCopyToRecents,
    onNavigate,
    onDayClick,
    onSyncSesame,
    locks: initialLocks,
  }: {
    startDate: Date;
    tasks: Task[];
    weeklyTarget?: number;
    taskTypeColors?: Record<string, string>;
    onSlotClick?: (date: Date) => void;
    onDayClick?: (date: Date) => void;
    onTaskClick?: (task: Task) => void;
    onTaskUpdate?: (
      task: Task,
      mode?: 'normal' | 'overwrite' | 'displacement',
    ) => void;
    onTaskDelete?: (taskId: number) => void;
    onTaskCopyToRecents?: (task: Task) => void;
    onNavigate?: (date: Date) => void;
    onSyncSesame?: () => Promise<void>;
    locks?: { move: boolean; edit: boolean; create: boolean };
  } = $props();

  let syncLoading = $state(false);

  async function handleSync() {
    if (!onSyncSesame || syncLoading) return;
    syncLoading = true;
    try {
      await onSyncSesame();
    } finally {
      syncLoading = false;
    }
  }

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

  // Quick Click State
  let clickInfo = $state<{
    startTime: number;
    startX: number;
    startY: number;
    task: Task;
  } | null>(null);
  const QUICK_CLICK_TIME_THRESHOLD = 250; // ms
  const QUICK_CLICK_MOVE_THRESHOLD = 5; // pixels

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

  // Collision State
  let collisionProposal = $state<Task | null>(null);

  // Action Locks
  let locks = $state(
    initialLocks || {
      move: false,
      edit: false,
      create: false,
    },
  );

  // Zoom State
  let zoomMultiplier = $state(1.0);
  const BASE_PIXELS_PER_MINUTE = 1;
  const pixelsPerMinute = $derived(BASE_PIXELS_PER_MINUTE * zoomMultiplier);
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3.0;

  const totalBillableHours = $derived(calculateWorkHours(tasks));
  const goalAbsenceHours = $derived(calculateGoalAbsenceHours(tasks));
  const effectiveGoal = $derived(weeklyTarget - goalAbsenceHours);
  const remainingTime = $derived(
    Math.max(0, effectiveGoal - totalBillableHours),
  );
  const progressPercentage = $derived(
    effectiveGoal > 0
      ? Math.min(100, (totalBillableHours / effectiveGoal) * 100)
      : 100,
  );

  function zoomIn() {
    zoomMultiplier = Math.min(MAX_ZOOM, zoomMultiplier + ZOOM_STEP);
  }

  function zoomOut() {
    zoomMultiplier = Math.max(MIN_ZOOM, zoomMultiplier - ZOOM_STEP);
  }

  function resetZoom() {
    zoomMultiplier = 1.0;
  }

  function formatDay(date: Date): string {
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return i18n.t(`days.${dayNames[date.getDay()]}`);
  }

  function formatTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  function handleLongPress(task: Task) {
    if (onTaskCopyToRecents) {
      onTaskCopyToRecents(task);
      // Feedback visual
      const taskEl = document.querySelector(
        `[aria-label="${i18n.t('weekly.edit_task', { title: task.title })}"]`,
      );
      if (taskEl) {
        taskEl.classList.add('copied-feedback');
        setTimeout(() => taskEl.classList.remove('copied-feedback'), 1000);
      }
    }

    // Evaluate for merge/snap/collision (same as move/resize)
    if (!checkForMerge(task)) {
      if (!checkForSnap(task)) {
        checkForCollision(task);
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

    const dailyTasks = effectiveTasks.filter(
      (t) => t.startTime >= dayStart && t.startTime <= dayEnd,
    );

    return calculateRestHours(dailyTasks).toFixed(2);
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
        // Use 1-minute tolerance for overlap detection
        const overlapMs =
          Math.min(t1.endTime.getTime(), t2.endTime.getTime()) -
          Math.max(t1.startTime.getTime(), t2.startTime.getTime());

        if (overlapMs >= 60000) {
          t1.hasOverlap = true;
          t2.hasOverlap = true;
        }
      }
    }

    return dailyTasks;
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
      mergeProposal = {
        task1: updatedTask,
        task2: taskAfter,
        movedTask: updatedTask,
      };
      return true;
    }

    // Case 2: another task ends when updatedTask starts
    const taskBefore = dailyTasks.find(
      (t) =>
        Math.abs(updatedTask.startTime.getTime() - t.endTime.getTime()) < 60000,
    );
    if (taskBefore) {
      mergeProposal = {
        task1: taskBefore,
        task2: updatedTask,
        movedTask: updatedTask,
      };
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
      const gapMs =
        updatedTask.startTime.getTime() - taskBefore.endTime.getTime();
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
    const taskAfter = dailyTasks.find(
      (t) => t.startTime >= updatedTask.endTime,
    );
    if (taskAfter) {
      const gapMs =
        taskAfter.startTime.getTime() - updatedTask.endTime.getTime();
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

  function checkForCollision(updatedTask: Task) {
    const collision = tasks.some((t) => {
      if (t.id === updatedTask.id) return false;
      const overlapMs =
        Math.min(t.endTime.getTime(), updatedTask.endTime.getTime()) -
        Math.max(t.startTime.getTime(), updatedTask.startTime.getTime());
      return overlapMs >= 60000;
    });

    if (collision) {
      collisionProposal = updatedTask;
      return true;
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
      startTime: new Date(
        Math.min(task1.startTime.getTime(), task2.startTime.getTime()),
      ),
      endTime: new Date(
        Math.max(task1.endTime.getTime(), task2.endTime.getTime()),
      ),
    };

    // Update task1 and delete task2
    if (task2.id !== undefined) {
      onTaskDelete(task2.id);
    }
    onTaskUpdate(mergedTask);

    mergeProposal = null;
  }

  function handleCancelProposal(proposalTask: Task) {
    if (!onTaskUpdate) return;
    const original = tasks.find((t) => t.id === proposalTask.id);
    if (
      original &&
      (original.startTime.getTime() !== proposalTask.startTime.getTime() ||
        original.endTime.getTime() !== proposalTask.endTime.getTime())
    ) {
      onTaskUpdate(proposalTask);
    }
  }

  function handleSlotClick(day: Date, hour: number) {
    if (locks.create) return;
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
      if (!locks.move) {
        longPressTimer = window.setTimeout(() => {
          handleLongPress(task);
          longPressTimer = null;
        }, LONG_PRESS_THRESHOLD);
      }

      // Initialize Quick Click detection even if move lock is active
      clickInfo = {
        startTime: Date.now(),
        startX: e.clientX,
        startY: e.clientY,
        task,
      };
    }

    if (locks.move) return;

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

    // If moved more than 5px, cancel long press and quick click
    if (Math.abs(deltaY) > QUICK_CLICK_MOVE_THRESHOLD || Math.abs(deltaX) > QUICK_CLICK_MOVE_THRESHOLD) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (clickInfo) {
        clickInfo = null;
      }
    }

    const minutesDelta = Math.round(deltaY / (15 * pixelsPerMinute)) * 15;

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

  function handlePointerUp(e: PointerEvent) {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    // Detect Quick Click
    if (clickInfo) {
      const timeDiff = Date.now() - clickInfo.startTime;
      const distDiff = Math.sqrt(
        Math.pow(e.clientX - clickInfo.startX, 2) +
          Math.pow(e.clientY - clickInfo.startY, 2),
      );

      if (
        timeDiff < QUICK_CLICK_TIME_THRESHOLD &&
        distDiff < QUICK_CLICK_MOVE_THRESHOLD
      ) {
        if (!locks.edit && onTaskClick) {
          onTaskClick(clickInfo.task);
        }
      }
    }

    // Reset Quick Click state
    clickInfo = null;

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
            if (!checkForCollision(dragInfo.currentTask)) {
              onTaskUpdate(dragInfo.currentTask);
            }
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

<div class="weekly-view" style="--pixels-per-minute: {pixelsPerMinute}">
  <WeeklyHeader
    {startDate}
    {onNavigate}
    {totalBillableHours}
    {effectiveGoal}
    {remainingTime}
    {progressPercentage}
    onSyncSesame={handleSync}
    {syncLoading}
  />
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
          aria-label={i18n.t('weekly.view_daily', { day: formatDay(day) })}
        >
          <span class="day-name">{formatDay(day)}</span>
          <span class="day-date">{day.toLocaleDateString()}</span>
          <div class="totals">
            <span class="day-total" title={i18n.t('weekly.billable_hours')}>
              {getDailyTotal(day)}h
            </span>
            <span class="day-total-rest" title={i18n.t('weekly.rest_hours')}>
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
          <WeeklyColumn
            {day}
            {hours}
            {pixelsPerMinute}
            tasks={getTasksForDay(day)}
            {taskTypeColors}
            {locks}
            {dragInfo}
            onSlotClick={handleSlotClick}
            onTaskClick={(task) => {
              if (locks.edit) return;
              if (onTaskClick) onTaskClick(task);
            }}
            {onTaskDelete}
            onPointerDown={handlePointerDown}
          />
        {/each}
      </div>
    </div>
  </div>
</div>

{#if mergeProposal}
  <div
    class="merge-modal-backdrop"
    onclick={() => (mergeProposal = null)}
    role="presentation"
  >
    <div
      class="merge-modal"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <h3>{i18n.t('weekly.merge_title')}</h3>
      <p>{i18n.t('weekly.merge_msg')}</p>
      <div class="merge-details">
        <div>
          <strong>{mergeProposal.task1.title}</strong> ({mergeProposal.task1
            .project})
        </div>
        <div>
          {mergeProposal.task1.startTime.toLocaleTimeString()} - {mergeProposal.task2.endTime.toLocaleTimeString()}
        </div>
      </div>
      <div class="merge-actions">
        <button
          class="btn-cancel"
          onclick={() => {
            if (mergeProposal) {
              handleCancelProposal(mergeProposal.movedTask);
              mergeProposal = null;
            }
          }}>{i18n.t('common.no')}</button
        >
        <button class="btn-confirm" onclick={handleMerge}
          >{i18n.t('common.yes')}</button
        >
      </div>
    </div>
  </div>
{/if}

{#if snapProposal}
  <div
    class="merge-modal-backdrop"
    onclick={() => (snapProposal = null)}
    role="presentation"
  >
    <div
      class="merge-modal"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <h3>{i18n.t('weekly.snap_title')}</h3>
      <p>
        {i18n.t('weekly.snap_msg', {
          side: i18n.t(`weekly.snap_${snapProposal.snapTo}`),
        })}
      </p>
      <div class="merge-actions">
        <button
          class="btn-cancel"
          onclick={() => {
            if (snapProposal) {
              handleCancelProposal(snapProposal.task);
              snapProposal = null;
            }
          }}>{i18n.t('common.no')}</button
        >
        <button class="btn-confirm" onclick={handleSnap}
          >{i18n.t('common.yes')}</button
        >
      </div>
    </div>
  </div>
{/if}

{#if collisionProposal}
  <div
    class="merge-modal-backdrop"
    onclick={() => (collisionProposal = null)}
    role="presentation"
  >
    <div
      class="merge-modal"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <h3>{i18n.t('weekly.collision_move_title')}</h3>
      <p>{i18n.t('weekly.collision_move_msg')}</p>
      <div class="merge-actions">
        <button
          class="btn-confirm"
          onclick={() => {
            if (collisionProposal && onTaskUpdate) {
              onTaskUpdate(collisionProposal, 'normal');
            }
            collisionProposal = null;
          }}>{i18n.t('task.continue_anyway')}</button
        >
        <button
          class="btn-confirm"
          onclick={() => {
            if (collisionProposal && onTaskUpdate) {
              onTaskUpdate(collisionProposal, 'overwrite');
            }
            collisionProposal = null;
          }}>{i18n.t('task.overwrite')}</button
        >
        <button
          class="btn-confirm"
          onclick={() => {
            if (collisionProposal && onTaskUpdate) {
              onTaskUpdate(collisionProposal, 'displacement');
            }
            collisionProposal = null;
          }}>{i18n.t('weekly.displace')}</button
        >
      </div>
    </div>
  </div>
{/if}

<div class="action-locks">
  <button
    class="lock-btn"
    class:active={locks.move}
    onclick={() => (locks.move = !locks.move)}
    title={i18n.t('weekly.lock_move')}
    aria-label={i18n.t('weekly.toggle_lock_move')}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path
        d={locks.move
          ? 'M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M12,17A3,3 0 0,1 9,14A3,3 0 0,1 12,11A3,3 0 0,1 15,14A3,3 0 0,1 12,17M15,8H9V6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8Z'
          : 'M12,17A3,3 0 0,1 9,14A3,3 0 0,1 12,11A3,3 0 0,1 15,14A3,3 0 0,1 12,17M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M9,6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8H9V6Z'}
      />
    </svg>
    <span>{i18n.t('weekly.move')}</span>
  </button>
  <button
    class="lock-btn"
    class:active={locks.edit}
    onclick={() => (locks.edit = !locks.edit)}
    title={i18n.t('weekly.lock_edit')}
    aria-label={i18n.t('weekly.toggle_lock_edit')}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path
        d={locks.edit
          ? 'M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M12,17A3,3 0 0,1 9,14A3,3 0 0,1 12,11A3,3 0 0,1 15,14A3,3 0 0,1 12,17M15,8H9V6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8Z'
          : 'M12,17A3,3 0 0,1 9,14A3,3 0 0,1 12,11A3,3 0 0,1 15,14A3,3 0 0,1 12,17M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M9,6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8H9V6Z'}
      />
    </svg>
    <span>{i18n.t('weekly.edit')}</span>
  </button>
  <button
    class="lock-btn"
    class:active={locks.create}
    onclick={() => (locks.create = !locks.create)}
    title={i18n.t('weekly.lock_create')}
    aria-label={i18n.t('weekly.toggle_lock_create')}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path
        d={locks.create
          ? 'M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M12,17A3,3 0 0,1 9,14A3,3 0 0,1 12,11A3,3 0 0,1 15,14A3,3 0 0,1 12,17M15,8H9V6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8Z'
          : 'M12,17A3,3 0 0,1 9,14A3,3 0 0,1 12,11A3,3 0 0,1 15,14A3,3 0 0,1 12,17M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M9,6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8H9V6Z'}
      />
    </svg>
    <span>{i18n.t('weekly.create')}</span>
  </button>
</div>

<div class="zoom-controls">
  <button
    class="zoom-btn"
    onclick={zoomIn}
    title={i18n.t('weekly.zoom_in')}
    aria-label={i18n.t('weekly.zoom_in')}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path
        d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C11.9,14 14,11.9 14,9.5C14,7.1 11.9,5 9.5,5C7.1,5 5,7.1 5,9.5C5,11.9 7.1,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z"
      />
    </svg>
  </button>
  <button
    class="zoom-btn"
    onclick={zoomOut}
    title={i18n.t('weekly.zoom_out')}
    aria-label={i18n.t('weekly.zoom_out')}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path
        d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C11.9,14 14,11.9 14,9.5C14,7.1 11.9,5 9.5,5C7.1,5 5,7.1 5,9.5C5,11.9 7.1,14 9.5,14M7,9H12V10H7V9Z"
      />
    </svg>
  </button>
  <button
    class="zoom-btn"
    onclick={resetZoom}
    title={i18n.t('weekly.reset_zoom')}
    aria-label={i18n.t('weekly.reset_zoom')}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path
        d="M12,18A6,6 0 1,0 6,12A6,6 0 0,0 12,18M12,4A8,8 0 1,1 4,12A8,8 0 0,1 12,4M11,7H13V13H11V7M11,15H13V17H11V15Z"
      />
    </svg>
  </button>
</div>

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

  .action-locks {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 50;
  }

  .lock-btn {
    background-color: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-primary);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 24px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .lock-btn.active {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border-color: var(--md-sys-color-primary);
  }

  .lock-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .zoom-controls {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 50;
  }

  .zoom-btn {
    background-color: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-primary);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
  }

  .zoom-btn:hover {
    transform: scale(1.1);
    background-color: var(--md-sys-color-primary-container);
  }

  .zoom-btn:active {
    transform: scale(0.95);
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
    min-height: calc(1440 * var(--pixels-per-minute) * 1px);
    position: sticky;
    left: 0;
    z-index: 10;
  }

  .hour-label {
    height: calc(60 * var(--pixels-per-minute) * 1px);
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
    min-height: calc(1440 * var(--pixels-per-minute) * 1px);
  }
</style>
