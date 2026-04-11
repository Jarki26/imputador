<script lang="ts">
  import { TaskStore } from './taskStore';
  import { ProjectStore } from './projectStore';
  import { formatDateForInput } from './utils';
  import { TASK_TYPES } from './config';
  import Modal from './Modal.svelte';
  import type { Task, RecentTask } from './db';

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
  let title = $state(editingTask?.title || '');
  let description = $state(editingTask?.description || '');
  let project = $state(editingTask?.project || '');
  let taskType = $state(editingTask?.type || 'General');
  let startTime = $state(
    initialStartTime ||
      (editingTask ? formatDateForInput(editingTask.startTime) : ''),
  );
  let endTime = $state(
    initialEndTime ||
      (editingTask ? formatDateForInput(editingTask.endTime) : ''),
  );
  let hours = $state(0);
  let minutes = $state(0);

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
    recentTasks = await taskStore.getRecentTasks();
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

  function updateEndTimeFromDuration() {
    if (startTime) {
      const start = new Date(startTime);
      const durationMs = hours * 60 * 60 * 1000 + minutes * 60 * 1000;
      const end = new Date(start.getTime() + durationMs);
      endTime = formatDateForInput(end);
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
        await taskStore.updateTask(editingTask.id, taskSnapshot);
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
        ? 'Failed to update task'
        : 'Failed to save task';
      console.error(err);
    }

    if (success) {
      showCollisionModal = false;
      pendingTaskData = null;
      title = '';
      description = '';
      project = '';
      taskType = 'General';
      startTime = '';
      endTime = '';
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
        errorMessage = 'Please provide a start date and a valid duration';
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
        startTime = '';
        endTime = '';
        hours = 0;
        minutes = 0;
        selectedRecentIndex = '';
        await refreshRecentTasks();
        if (onSuccess) await onSuccess();
      } catch (err) {
        errorMessage = 'Failed to perform smart fill';
        console.error(err);
      }
      return;
    }

    if (!startTime || !endTime) {
      errorMessage = 'Please provide valid start and end times';
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      errorMessage = 'End time must be after start time';
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
      errorMessage = 'An error occurred while checking for collisions';
      console.error(err);
    }
  }
</script>

<form onsubmit={handleSubmit} class="task-form" novalidate>
  {#if recentTasks.length > 0}
    <div class="field">
      <label for="recentTasks">Recent Tasks</label>
      <select
        id="recentTasks"
        bind:value={selectedRecentIndex}
        onchange={onRecentTaskChange}
      >
        <option value="">-- Select a recent task --</option>
        {#each recentTasks as task, i}
          <option value={i.toString()}>
            {task.title} ({task.project})
          </option>
        {/each}
      </select>
    </div>
  {/if}

  <div class="field">
    <label for="title">Title</label>
    <input id="title" name="title" type="text" required bind:value={title} />
  </div>

  <div class="field">
    <label for="description">Description</label>
    <textarea id="description" name="description" bind:value={description}
    ></textarea>
  </div>

  <div class="field">
    <label for="project">Project</label>
    <input
      id="project"
      name="project"
      type="text"
      required
      bind:value={project}
    />
  </div>

  <div class="field">
    <label for="taskType">Task Type</label>
    <select id="taskType" name="taskType" bind:value={taskType}>
      {#each TASK_TYPES as type (type.name)}
        <option value={type.name}>{type.name}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="startTime">Start Time</label>
    <input
      id="startTime"
      name="startTime"
      type="datetime-local"
      required
      bind:value={startTime}
      oninput={updateDurationFromTimes}
    />
  </div>

  <div class="field">
    <label for="endTime">End Time</label>
    <input
      id="endTime"
      name="endTime"
      type="datetime-local"
      required={!isSmartFill}
      disabled={isSmartFill}
      bind:value={endTime}
      oninput={updateDurationFromTimes}
    />
  </div>

  <div class="field checkbox-field">
    <label for="smartFill">
      <input id="smartFill" type="checkbox" bind:checked={isSmartFill} />
      Smart Fill (auto-distribute duration in gaps)
    </label>
  </div>

  <div class="duration-fields">
    <div class="field">
      <label for="durationHours">Hours</label>
      <input
        id="durationHours"
        type="number"
        min="0"
        bind:value={hours}
        oninput={updateEndTimeFromDuration}
      />
    </div>
    <div class="field">
      <label for="durationMinutes">Minutes</label>
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
    {editingTask ? 'Update Task' : 'Add Task'}
  </button>
</form>

<Modal
  show={showCollisionModal}
  title="Collision Detected"
  onClose={() => (showCollisionModal = false)}
>
  <p>This task overlaps with existing tasks. How would you like to proceed?</p>
  <div class="modal-actions">
    <button class="btn secondary" onclick={() => (showCollisionModal = false)}>
      Cancel
    </button>
    <button
      class="btn primary"
      onclick={() => pendingTaskData && saveTask(pendingTaskData, 'overwrite')}
    >
      Overwrite
    </button>
    <button
      class="btn primary"
      onclick={() =>
        pendingTaskData && saveTask(pendingTaskData, 'displacement')}
    >
      Displacement
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
