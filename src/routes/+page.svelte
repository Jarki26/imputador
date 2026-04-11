<script lang="ts">
  import TaskForm from '$lib/TaskForm.svelte';
  import TaskList from '$lib/TaskList.svelte';
  import WeeklyView from '$lib/WeeklyView.svelte';
  import Settings from '$lib/Settings.svelte';
  import Modal from '$lib/Modal.svelte';
  import { TaskStore } from '$lib/taskStore';
  import { ProjectStore } from '$lib/projectStore';
  import { ConfigStore } from '$lib/configStore';
  import { formatDateForInput } from '$lib/utils';
  import { onMount } from 'svelte';
  import type { Task } from '$lib/db';

  const taskStore = new TaskStore();
  const projectStore = new ProjectStore();
  const configStore = new ConfigStore();

  let tasks: Task[] = $state([]);
  let today = new Date();
  let view: 'daily' | 'weekly' = $state('weekly');

  let showModal = $state(false);
  let showSettings = $state(false);
  let weeklyTarget = $state(41);
  let selectedStartTime = $state('');
  let selectedEndTime = $state('');
  let editingTask: Task | null = $state(null);

  async function loadTasks() {
    if (view === 'weekly') {
      tasks = await taskStore.getTasksForWeek(today);
    } else {
      tasks = await taskStore.getTasksForDay(today);
    }
  }

  $effect(() => {
    loadTasks();
  });

  onMount(async () => {
    await loadTasks();
    weeklyTarget = await configStore.getWeeklyHoursTarget();
  });

  async function onTaskAdded() {
    await loadTasks();
    closeModal();
  }

  function handleSlotClick(date: Date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(start.getHours() + 1);

    selectedStartTime = formatDateForInput(start);
    selectedEndTime = formatDateForInput(end);
    editingTask = null;
    showModal = true;
  }

  function handleTaskClick(task: Task) {
    editingTask = task;
    selectedStartTime = '';
    selectedEndTime = '';
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingTask = null;
    selectedStartTime = '';
    selectedEndTime = '';
  }

  async function handleTaskUpdate(updatedTask: Task) {
    if (updatedTask.id) {
      const { id, ...data } = updatedTask;
      await taskStore.updateTask(id, data);
      await loadTasks();
    }
  }

  async function handleSettingsSave(target: number) {
    await configStore.setWeeklyHoursTarget(target);
    weeklyTarget = target;
    showSettings = false;
  }
</script>

<div class="dashboard">
  <header>
    <div class="header-content">
      <div class="title-row">
        <h1>Imputador</h1>
        <button
          class="settings-btn"
          onclick={() => (showSettings = true)}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>
      <p class="subtitle">Log your workday efficiently.</p>
    </div>
    <div class="view-toggle">
      <button
        class="toggle-btn"
        class:active={view === 'weekly'}
        onclick={() => (view = 'weekly')}
      >
        Weekly View
      </button>
      <button
        class="toggle-btn"
        class:active={view === 'daily'}
        onclick={() => (view = 'daily')}
      >
        Daily View
      </button>
    </div>
  </header>

  {#if view === 'daily'}
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
  {:else}
    <div class="weekly-container">
      <WeeklyView
        startDate={today}
        {tasks}
        {weeklyTarget}
        onSlotClick={handleSlotClick}
        onTaskClick={handleTaskClick}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  {/if}

  {#if showModal}
    <div class="modal-backdrop" onclick={closeModal} role="presentation">
      <div
        class="modal-content"
        onclick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <header class="modal-header">
          <h2>{editingTask ? 'Edit Task' : 'Register Task'}</h2>
          <button class="close-btn" onclick={closeModal}>&times;</button>
        </header>
        <TaskForm
          {taskStore}
          {projectStore}
          onSuccess={onTaskAdded}
          initialStartTime={selectedStartTime}
          initialEndTime={selectedEndTime}
          {editingTask}
        />
      </div>
    </div>
  {/if}

  <Modal
    show={showSettings}
    title="Settings"
    onClose={() => (showSettings = false)}
  >
    <Settings {weeklyTarget} onSave={handleSettingsSave} />
  </Modal>
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .settings-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    line-height: 1;
    transition: background-color 0.2s;
  }

  .settings-btn:hover {
    background-color: var(--md-sys-color-surface-container-high);
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

  .view-toggle {
    display: flex;
    background-color: var(--md-sys-color-secondary-container);
    padding: 4px;
    border-radius: 20px;
  }

  .toggle-btn {
    padding: 8px 16px;
    border: none;
    background: none;
    border-radius: 16px;
    cursor: pointer;
    font-weight: 500;
    color: var(--md-sys-color-on-secondary-container);
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .toggle-btn.active {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
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

  .weekly-container {
    height: 700px;
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

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--md-sys-color-surface);
    padding: 2rem;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 550px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .modal-header h2 {
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant);
  }
</style>
