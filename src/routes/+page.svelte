<script lang="ts">
  import TaskForm from '$lib/TaskForm.svelte';
  import TaskList from '$lib/TaskList.svelte';
  import { TaskStore } from '$lib/taskStore';
  import { ProjectStore } from '$lib/projectStore';
  import { onMount } from 'svelte';
  import type { Task } from '$lib/db';

  const taskStore = new TaskStore();
  const projectStore = new ProjectStore();

  let tasks: Task[] = $state([]);
  let today = new Date();

  async function loadTasks() {
    tasks = await taskStore.getTasksForDay(today);
  }

  onMount(async () => {
    await loadTasks();
  });

  async function onTaskAdded() {
    await loadTasks();
  }
</script>

<div class="dashboard">
  <header>
    <h1>Imputador</h1>
    <p class="subtitle">Log your workday efficiently.</p>
  </header>

  <div class="grid">
    <section class="form-section">
      <h2>Register Task</h2>
      <TaskForm {taskStore} {projectStore} onSuccess={onTaskAdded} />
    </section>

    <section class="list-section">
      <h2>Daily Log - {today.toLocaleDateString()}</h2>
      <TaskList {tasks} />
    </section>
  </div>
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  header h1 {
    margin: 0;
    color: var(--md-sys-color-primary);
    font-size: 2.5rem;
  }

  .subtitle {
    margin: 0.25rem 0 0 0;
    color: var(--md-sys-color-on-surface-variant);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 800px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: var(--md-sys-color-secondary);
  }

  .form-section,
  .list-section {
    background: var(--md-sys-color-surface);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
</style>
