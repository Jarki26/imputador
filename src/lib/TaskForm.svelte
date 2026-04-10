<script lang="ts">
  import { TaskStore } from './taskStore';
  import { ProjectStore } from './projectStore';

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

  const taskTypes = ['General', 'Feature', 'Bug', 'Rest', 'Meeting'];

  function formatDateForInput(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    errorMessage = '';

    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || title;
    const project = formData.get('project') as string;
    const taskType = formData.get('taskType') as string;
    const startTimeStr = formData.get('startTime') as string;
    const endTimeStr = formData.get('endTime') as string;

    if (!startTimeStr || !endTimeStr) {
      errorMessage = 'Please provide valid start and end times';
      return;
    }

    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);

    if (end <= start) {
      errorMessage = 'End time must be after start time';
      return;
    }

    try {
      if (editingTask && editingTask.id) {
        await taskStore.updateTask(editingTask.id, {
          title,
          description,
          project,
          type: taskType,
          startTime: start,
          endTime: end,
        });
      } else {
        await taskStore.addTask({
          title,
          description,
          project,
          type: taskType,
          startTime: start,
          endTime: end,
        });
      }

      if (project) {
        await projectStore.upsertProject(project);
      }

      form.reset();
      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      errorMessage = editingTask ? 'Failed to update task' : 'Failed to save task';
      console.error(err);
    }
  }
</script>

<form onsubmit={handleSubmit} class="task-form" novalidate>
  <div class="field">
    <label for="title">Title</label>
    <input id="title" name="title" type="text" required value={editingTask?.title || ''} />
  </div>

  <div class="field">
    <label for="description">Description</label>
    <textarea id="description" name="description" value={editingTask?.description || ''}></textarea>
  </div>

  <div class="field">
    <label for="project">Project</label>
    <input id="project" name="project" type="text" required value={editingTask?.project || ''} />
  </div>

  <div class="field">
    <label for="taskType">Task Type</label>
    <select id="taskType" name="taskType" value={editingTask?.type || 'General'}>
      {#each taskTypes as type}
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
      value={initialStartTime || (editingTask ? formatDateForInput(editingTask.startTime) : '')}
    />
  </div>

  <div class="field">
    <label for="endTime">End Time</label>
    <input
      id="endTime"
      name="endTime"
      type="datetime-local"
      required
      value={initialEndTime || (editingTask ? formatDateForInput(editingTask.endTime) : '')}
    />
  </div>

  {#if errorMessage}
    <p class="error" role="alert">{errorMessage}</p>
  {/if}

  <button type="submit" class="submit-btn">
    {editingTask ? 'Update Task' : 'Add Task'}
  </button>
</form>

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
</style>
