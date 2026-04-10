<script lang="ts">
  import type { Task } from './db';

  let { tasks = [] }: { tasks: Task[] } = $props();

  const sortedTasks = $derived(
    [...tasks].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
  );

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function hasGap(prevTask: Task, currentTask: Task): boolean {
    // A gap exists if the current task starts after the previous task ends.
    // We'll consider a gap significant if it's more than 1 minute (to avoid precision issues).
    return currentTask.startTime.getTime() > prevTask.endTime.getTime() + 60000;
  }
</script>

<div class="task-list">
  {#if sortedTasks.length === 0}
    <p class="empty-message">No tasks for this day</p>
  {:else}
    {#each sortedTasks as task, i (task.id || i)}
      {#if i > 0 && hasGap(sortedTasks[i - 1], task)}
        <div class="gap-alert">
          <p>
            Gap detected between {formatTime(sortedTasks[i - 1].endTime)} and
            {formatTime(task.startTime)}
          </p>
        </div>
      {/if}
      <div class="task-item">
        <div class="task-header">
          <h3>{task.title}</h3>
          <span class="type-badge">{task.type}</span>
        </div>
        <p class="project">{task.project}</p>
        <p class="time">
          {formatTime(task.startTime)} - {formatTime(task.endTime)}
        </p>
        {#if task.description && task.description !== task.title}
          <p class="description">{task.description}</p>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .empty-message {
    text-align: center;
    color: var(--md-sys-color-on-surface-variant);
    padding: 2rem;
    background-color: var(--md-sys-color-surface-variant);
    border-radius: 12px;
  }

  .task-item {
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid var(--md-sys-color-outline);
    transition: box-shadow 0.2s;
  }

  .task-item:hover {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.25rem;
  }

  .task-item h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--md-sys-color-on-surface);
  }

  .project {
    font-weight: 500;
    color: var(--md-sys-color-primary);
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }

  .time {
    font-size: 0.85rem;
    color: var(--md-sys-color-secondary);
    margin: 0.25rem 0;
  }

  .description {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
    color: var(--md-sys-color-on-surface-variant);
    border-top: 1px solid var(--md-sys-color-surface-variant);
    padding-top: 0.5rem;
  }

  .type-badge {
    padding: 4px 12px;
    border-radius: 16px;
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .gap-alert {
    background-color: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
    padding: 0.5rem;
    border-radius: 8px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 500;
    border: 1px dashed var(--md-sys-color-error);
  }

  .gap-alert p {
    margin: 0;
  }
</style>
