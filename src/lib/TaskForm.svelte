<script lang="ts">
  import { TaskStore } from './taskStore';
  import { ProjectStore } from './projectStore';
  import { formatDateForInput } from './utils';
  import Modal from './Modal.svelte';
  import type { Task } from './db';

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

  const taskTypes = ['General', 'Feature', 'Bug', 'Rest', 'Meeting'];

  async function saveTask(
    task: Task,
    mode: 'normal' | 'overwrite' | 'displacement' = 'normal',
  ) {
    try {
      if (editingTask && editingTask.id) {
        // For updates, the current implementation doesn't have updateWithOverwrite yet
        // but we can delete and re-add or improve TaskStore later.
        // For now, let's stick to specification which mostly talks about "Insert".
        await taskStore.updateTask(editingTask.id, task);
      } else {
        if (mode === 'overwrite') {
          await taskStore.addWithOverwrite(task);
        } else if (mode === 'displacement') {
          await taskStore.addWithDisplacement(task);
        } else {
          await taskStore.addTask(task);
        }
      }

      if (task.project) {
        await projectStore.upsertProject(task.project);
      }

      showCollisionModal = false;
      pendingTaskData = null;
      startTime = '';
      endTime = '';
      hours = 0;
      minutes = 0;

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      errorMessage = editingTask
        ? 'Failed to update task'
        : 'Failed to save task';
      console.error(err);
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = '';

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || title;
    const project = formData.get('project') as string;
    const taskType = formData.get('taskType') as string;

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
      title,
      description,
      project,
      type: taskType,
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
      form.reset();
    } catch (err) {
      errorMessage = 'An error occurred while checking for collisions';
      console.error(err);
    }
  }
</script>

<form onsubmit={handleSubmit} class="task-form" novalidate>
  <div class="field">
    <label for="title">Title</label>
    <input
      id="title"
      name="title"
      type="text"
      required
      value={editingTask?.title || ''}
    />
  </div>

  <div class="field">
    <label for="description">Description</label>
    <textarea
      id="description"
      name="description"
      value={editingTask?.description || ''}
    ></textarea>
  </div>

  <div class="field">
    <label for="project">Project</label>
    <input
      id="project"
      name="project"
      type="text"
      required
      value={editingTask?.project || ''}
    />
  </div>

  <div class="field">
    <label for="taskType">Task Type</label>
    <select id="taskType" name="taskType" value={editingTask?.type || 'General'}>
      {#each taskTypes as type (type)}
        <option value={type}>{type}</option>
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
      required
      bind:value={endTime}
      oninput={updateDurationFromTimes}
    />
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
