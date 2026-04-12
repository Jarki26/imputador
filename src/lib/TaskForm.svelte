<script lang="ts">
  import { TaskStore } from './taskStore';
  import { ProjectStore } from './projectStore';
  import {
    formatDateForInput,
    formatDateOnlyForInput,
    formatTimeOnlyForInput,
  } from './utils';
  import { TASK_TYPES } from './config';
  import Modal from './Modal.svelte';
  import type { Task, RecentTask } from './db';
  import { i18n } from './i18n.svelte';

  interface Props {
    taskStore?: TaskStore;
    projectStore?: ProjectStore;
    onSuccess?: () => void | Promise<void>;
    initialStartTime?: string;
    initialEndTime?: string;
    editingTask?: Task | null;
  }

  let {
    taskStore = new TaskStore(),
    projectStore = new ProjectStore(),
    onSuccess,
    initialStartTime = '',
    initialEndTime = '',
    editingTask = null,
  }: Props = $props();

  let errorMessage = $state('');
  let title = $state('');
  let description = $state('');
  let project = $state('');
  let taskType = $state('General');
  let taskDate = $state(formatDateOnlyForInput(new Date()));
  let startTimeStr = $state(formatTimeOnlyForInput(new Date()));
  let endTimeStr = $state(formatTimeOnlyForInput(new Date(Date.now() + 3600000)));

  // Synchronization with props
  $effect(() => {
    if (editingTask) {
      title = editingTask.title || '';
      description = editingTask.description || '';
      project = editingTask.project || '';
      taskType = editingTask.type || 'General';
      taskDate = formatDateOnlyForInput(editingTask.startTime);
      startTimeStr = formatTimeOnlyForInput(editingTask.startTime);
      endTimeStr = formatTimeOnlyForInput(editingTask.endTime);
    } else {
      title = '';
      description = '';
      project = '';
      taskType = 'General';
      if (initialStartTime) {
        const start = new Date(initialStartTime);
        taskDate = formatDateOnlyForInput(start);
        startTimeStr = formatTimeOnlyForInput(start);
        if (initialEndTime) {
          endTimeStr = formatTimeOnlyForInput(new Date(initialEndTime));
        } else {
          endTimeStr = formatTimeOnlyForInput(new Date(start.getTime() + 3600000));
        }
      } else {
        taskDate = formatDateOnlyForInput(new Date());
        startTimeStr = formatTimeOnlyForInput(new Date());
        endTimeStr = formatTimeOnlyForInput(new Date(Date.now() + 3600000));
      }
    }
  });

  let startTime = $derived(`${taskDate}T${startTimeStr}`);
  let endTime = $derived(`${taskDate}T${endTimeStr}`);

  let hours = $state(0);
  let minutes = $state(0);
  let isLocked = $state(false);

  let showCollisionModal = $state(false);
  let pendingTaskData = $state<Task | null>(null);
  let isSmartFill = $state(false);
  let recentTasks = $state<RecentTask[]>([]);
  let selectedRecentIndex = $state('');

  // Fetch recent tasks on mount
  $effect(() => {
    refreshRecentTasks();
  });

  async function refreshRecentTasks() {
    if (typeof taskStore.getRecentTasks === 'function') {
      recentTasks = await taskStore.getRecentTasks();
    }
  }

  function onRecentTaskChange(e: Event) {
    const indexStr = (e.target as HTMLSelectElement).value;
    if (indexStr !== '') {
      const index = parseInt(indexStr);
      const task = recentTasks[index];
      title = task.title;
      description = task.description;
      project = task.project;
      taskType = task.type;
    }
  }

  // Initialize duration from times
  $effect.pre(() => {
    updateDurationFromTimes();
  });

  function updateDurationFromTimes() {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end >= start) {
        const diff = end.getTime() - start.getTime();
        hours = Math.floor(diff / (1000 * 60 * 60));
        minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      }
    }
  }

  function handleStartTimeInput() {
    if (isLocked) {
      updateEndTimeFromDuration();
    } else {
      updateDurationFromTimes();
    }
  }

  function updateEndTimeFromDuration() {
    if (startTime) {
      const start = new Date(startTime);
      const durationMs = hours * 60 * 60 * 1000 + minutes * 60 * 1000;
      const end = new Date(start.getTime() + durationMs);
      endTimeStr = formatTimeOnlyForInput(end);
    }
  }

  async function saveTask(
    task: Task,
    mode: 'normal' | 'overwrite' | 'displacement' = 'normal',
  ) {
    let success = false;
    const taskSnapshot = $state.snapshot(task);
    try {
      if (editingTask && editingTask.id) {
        if (mode === 'overwrite') {
          await taskStore.updateWithOverwrite(editingTask.id, taskSnapshot);
        } else if (mode === 'displacement') {
          await taskStore.updateWithDisplacement(editingTask.id, taskSnapshot);
        } else {
          await taskStore.updateTask(editingTask.id, taskSnapshot);
        }
      } else {
        if (mode === 'overwrite') {
          await taskStore.addWithOverwrite(taskSnapshot);
        } else if (mode === 'displacement') {
          await taskStore.addWithDisplacement(taskSnapshot);
        } else {
          await taskStore.addTask(taskSnapshot);
        }
      }

      if (taskSnapshot.project) {
        await projectStore.upsertProject(taskSnapshot.project);
      }
      success = true;
    } catch (err) {
      errorMessage = editingTask
        ? i18n.t('task.error_update_failed')
        : i18n.t('task.error_save_failed');
      console.error(err);
    }

    if (success) {
      showCollisionModal = false;
      pendingTaskData = null;
      title = '';
      description = '';
      project = '';
      taskType = 'General';
      taskDate = formatDateOnlyForInput(new Date());
      startTimeStr = formatTimeOnlyForInput(new Date());
      endTimeStr = formatTimeOnlyForInput(
        new Date(new Date().getTime() + 60 * 60 * 1000),
      );
      hours = 0;
      minutes = 0;
      selectedRecentIndex = '';
      await refreshRecentTasks();

      if (onSuccess) {
        try {
          await onSuccess();
        } catch (err) {
          console.error('Error in onSuccess callback:', err);
        }
      }
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = '';

    const currentTitle = title;
    const currentDescription = description || currentTitle;
    const currentProject = project;
    const currentTaskType = taskType;

    if (isSmartFill) {
      if (!startTime || (hours === 0 && minutes === 0)) {
        errorMessage = i18n.t('task.error_smart_fill');
        return;
      }

      const start = new Date(startTime);
      const durationMs = hours * 60 * 60 * 1000 + minutes * 60 * 1000;

      try {
        await taskStore.addWithSmartFill(
          {
            title: currentTitle,
            description: currentDescription,
            project: currentProject,
            type: currentTaskType,
          },
          start,
          durationMs,
        );
        if (currentProject) {
          await projectStore.upsertProject(currentProject);
        }
        isSmartFill = false;
        title = '';
        description = '';
        project = '';
        taskType = 'General';
        taskDate = formatDateOnlyForInput(new Date());
        startTimeStr = formatTimeOnlyForInput(new Date());
        endTimeStr = formatTimeOnlyForInput(
          new Date(new Date().getTime() + 60 * 60 * 1000),
        );
        hours = 0;
        minutes = 0;
        selectedRecentIndex = '';
        await refreshRecentTasks();
        if (onSuccess) await onSuccess();
      } catch (err) {
        errorMessage = i18n.t('task.error_save_failed'); // Or specific smart fill error if needed
        console.error(err);
      }
      return;
    }

    if (!startTimeStr || !endTimeStr) {
      errorMessage = i18n.t('task.error_missing_times');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Cross-day validation check
    const startDay = formatDateOnlyForInput(start);
    const endDay = formatDateOnlyForInput(end);

    if (startDay !== endDay) {
      errorMessage = i18n.t('task.error_single_day');
      return;
    }

    if (end <= start) {
      errorMessage = i18n.t('task.error_midnight');
      return;
    }

    const taskData: Task = {
      title: currentTitle,
      description: currentDescription,
      project: currentProject,
      type: currentTaskType,
      startTime: start,
      endTime: end,
    };

    try {
      // Check for collisions
      const existingTasks = await taskStore.getTasksForDay(start);
      const collision = existingTasks.some(
        (t) =>
          (!editingTask || t.id !== editingTask.id) &&
          t.startTime < end &&
          t.endTime > start,
      );

      if (collision) {
        pendingTaskData = taskData;
        showCollisionModal = true;
        return;
      }

      await saveTask(taskData);
    } catch (err) {
      errorMessage = i18n.t('task.error_collision_check');
      console.error(err);
    }
  }
</script>

<form onsubmit={handleSubmit} class="task-form" novalidate>
  {#if recentTasks.length > 0}
    <div class="field">
      <label for="recentTasks">{i18n.t('task.recent_tasks')}</label>
      <select
        id="recentTasks"
        bind:value={selectedRecentIndex}
        onchange={onRecentTaskChange}
      >
        <option value="">{i18n.t('task.select_recent')}</option>
        {#each recentTasks as task, i}
          <option value={i.toString()}>
            {task.title} ({task.project})
          </option>
        {/each}
      </select>
    </div>
  {/if}

  <div class="field">
    <label for="title">{i18n.t('task.title')}</label>
    <input id="title" name="title" type="text" required bind:value={title} />
  </div>

  <div class="field">
    <label for="description">{i18n.t('task.description')}</label>
    <textarea id="description" name="description" bind:value={description}
    ></textarea>
  </div>

  <div class="field">
    <label for="project">{i18n.t('task.project')}</label>
    <input
      id="project"
      name="project"
      type="text"
      required
      bind:value={project}
    />
  </div>

  <div class="field">
    <label for="taskType">{i18n.t('task.type')}</label>
    <select id="taskType" name="taskType" bind:value={taskType}>
      {#each TASK_TYPES as type (type.name)}
        <option value={type.name}>{type.name}</option>
      {#if false} <!-- Keep i18n.t calls for static analysis if needed, though they aren't used here as names are dynamic from config -->
        {i18n.t('task.type')}
      {/if}
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="taskDate">{i18n.t('task.date')}</label>
    <input
      id="taskDate"
      name="taskDate"
      type="date"
      required
      bind:value={taskDate}
    />
  </div>

  <div class="field">
    <label for="startTime">{i18n.t('task.start_time')}</label>
    <input
      id="startTime"
      name="startTime"
      type="time"
      required
      bind:value={startTimeStr}
      oninput={handleStartTimeInput}
    />
  </div>

  <div class="lock-container">
    <button
      type="button"
      class="lock-btn"
      class:active={isLocked}
      onclick={() => (isLocked = !isLocked)}
      title={i18n.t('task.toggle_lock')}
      aria-label={i18n.t('task.toggle_lock')}
      aria-pressed={isLocked}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        {#if isLocked}
          <path
            d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"
          />
        {:else}
          <path
            d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"
          />
        {/if}
      </svg>
    </button>
    <span class="lock-info">
      {isLocked ? i18n.t('task.duration_locked') : i18n.t('task.duration_free')}
    </span>
  </div>

  <div class="field">
    <label for="endTime">{i18n.t('task.end_time')}</label>
    <input
      id="endTime"
      name="endTime"
      type="time"
      required={!isSmartFill}
      disabled={isSmartFill}
      bind:value={endTimeStr}
      oninput={updateDurationFromTimes}
    />
  </div>

  <div class="field checkbox-field">
    <label for="smartFill">
      <input id="smartFill" type="checkbox" bind:checked={isSmartFill} />
      {i18n.t('task.smart_fill')}
    </label>
  </div>

  <div class="duration-fields">
    <div class="field">
      <label for="durationHours">{i18n.t('task.hours')}</label>
      <input
        id="durationHours"
        type="number"
        min="0"
        bind:value={hours}
        oninput={updateEndTimeFromDuration}
      />
    </div>
    <div class="field">
      <label for="durationMinutes">{i18n.t('task.minutes')}</label>
      <input
        id="durationMinutes"
        type="number"
        min="0"
        max="59"
        bind:value={minutes}
        oninput={updateEndTimeFromDuration}
      />
    </div>
  </div>

  {#if errorMessage}
    <p class="error" role="alert">{errorMessage}</p>
  {/if}

  <button type="submit" class="submit-btn">
    {editingTask ? i18n.t('task.form_title_edit') : i18n.t('task.form_title_add')}
  </button>
</form>

<Modal
  show={showCollisionModal}
  title={i18n.t('task.collision_title')}
  onClose={() => (showCollisionModal = false)}
>
  <p>{i18n.t('task.collision_msg')}</p>
  <div class="modal-actions">
    <button class="btn secondary" onclick={() => (showCollisionModal = false)}>
      {i18n.t('common.cancel')}
    </button>
    <button
      class="btn primary"
      onclick={() => pendingTaskData && saveTask(pendingTaskData, 'overwrite')}
    >
      {i18n.t('task.overwrite')}
    </button>
    <button
      class="btn primary"
      onclick={() =>
        pendingTaskData && saveTask(pendingTaskData, 'displacement')}
    >
      {i18n.t('task.displacement')}
    </button>
  </div>
</Modal>

<style>
  .task-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--md-sys-color-surface-variant);
    border-radius: 1rem;
    max-width: 500px;
  }

  .duration-fields {
    display: flex;
    gap: 1rem;
  }

  .duration-fields .field {
    flex: 1;
  }

  .lock-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin: -0.5rem 0;
  }

  .lock-info {
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
    font-style: italic;
  }

  .lock-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--md-sys-color-outline);
    border-radius: 50%;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .lock-btn:hover {
    background-color: var(--md-sys-color-surface-container-highest);
  }

  .lock-btn.active {
    color: var(--md-sys-color-primary);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .checkbox-field {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .checkbox-field label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-field input {
    width: auto;
    margin: 0;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
  }

  input,
  textarea,
  select {
    padding: 0.75rem;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 0.25rem;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    font-family: inherit;
  }

  .submit-btn {
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    border-radius: 2rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .submit-btn:hover {
    opacity: 0.9;
  }

  .error {
    color: var(--md-sys-color-error);
    font-size: 0.875rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }

  .btn.primary {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }

  .btn.secondary {
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
  }
</style>
