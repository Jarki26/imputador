<script lang="ts">
  import { onMount } from 'svelte';
  import { TaskStore } from '$lib/taskStore';
  import { ConfigStore } from '$lib/configStore';
  import { HistoryStore } from '$lib/historyStore.svelte';
  import WeeklyView from '$lib/WeeklyView.svelte';
  import TaskList from '$lib/TaskList.svelte';
  import TaskForm from '$lib/TaskForm.svelte';
  import Settings from '$lib/Settings.svelte';
  import Modal from '$lib/Modal.svelte';
  import Tutorial from '$lib/Tutorial.svelte';
  import type { Task } from '$lib/db';
  import { i18n } from '$lib/i18n.svelte';

  const taskStore = new TaskStore();
  const configStore = new ConfigStore();
  const historyStore = new HistoryStore();

  let tasks = $state<Task[]>([]);
  let weeklyTarget = $state(41);
  let view = $state<'weekly' | 'daily'>('weekly');
  let selectedDate = $state(new Date());
  let showAddModal = $state(false);
  let showSettingsModal = $state(false);
  let showTutorial = $state(false);
  let editingTask = $state<Task | null>(null);
  let initialStartTime = $state('');

  async function loadTasks(pushToHistory = false) {
    const newTasks = await taskStore.getTasksForWeek(selectedDate);
    tasks = newTasks;
    if (pushToHistory) {
      historyStore.push({ tasks: [...newTasks], date: new Date(selectedDate) });
    }
  }

  async function loadConfig() {
    weeklyTarget = await configStore.getWeeklyHoursTarget();
  }

  onMount(async () => {
    await loadTasks(true); // Initial state for history
    await loadConfig();
  });

  async function handleTaskUpdate(
    task: Task,
    mode: 'normal' | 'overwrite' | 'displacement' = 'normal',
  ) {
    if (task.id) {
      if (mode === 'overwrite') {
        await taskStore.updateWithOverwrite(task.id, task);
      } else if (mode === 'displacement') {
        await taskStore.updateWithDisplacement(task.id, task);
      } else {
        await taskStore.updateTask(task.id, task);
      }
      await loadTasks(true);
    }
  }

  async function handleTaskDelete(id: number) {
    await taskStore.deleteTask(id);
    await loadTasks(true);
  }

  function handleSlotClick(date: Date) {
    initialStartTime = date.toISOString();
    editingTask = null;
    showAddModal = true;
  }

  function handleTaskClick(task: Task) {
    editingTask = task;
    initialStartTime = '';
    showAddModal = true;
  }

  async function handleSaveSettings(target: number) {
    await configStore.setWeeklyHoursTarget(target);
    weeklyTarget = target;
    showSettingsModal = false;
  }

  const dailyTasks = $derived(
    tasks.filter((t) => {
      const d1 = new Date(t.startTime);
      const d2 = new Date(selectedDate);
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    }),
  );

  async function handleUndo() {
    const prevState = historyStore.undo();
    if (prevState) {
      selectedDate = new Date(prevState.date);
      await taskStore.setTasksForWeek(selectedDate, prevState.tasks);
      await loadTasks(false);
    }
  }

  async function handleRedo() {
    const nextState = historyStore.redo();
    if (nextState) {
      selectedDate = new Date(nextState.date);
      await taskStore.setTasksForWeek(selectedDate, nextState.tasks);
      await loadTasks(false);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    const isZ = e.key.toLowerCase() === 'z';
    const isY = e.key.toLowerCase() === 'y';
    const mod = e.ctrlKey || e.metaKey;

    if (mod && isZ) {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if (mod && isY) {
      e.preventDefault();
      handleRedo();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main class="app-container">
  <header class="app-header">
    <div class="logo">
      <h1>{i18n.t('app.title')}</h1>
    </div>
    <div class="header-actions">
      <div class="view-toggle">
        <button
          class:active={view === 'weekly'}
          onclick={() => (view = 'weekly')}
        >
          {i18n.t('app.weekly_view')}
        </button>
        <button class:active={view === 'daily'} onclick={() => (view = 'daily')}>
          {i18n.t('app.daily_view')}
        </button>
      </div>
      <div class="header-btns">
        <button
          class="icon-btn"
          onclick={() => (showTutorial = true)}
          title={i18n.t('app.help')}
          aria-label={i18n.t('app.help')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
          </svg>
        </button>
        <button
          class="icon-btn"
          onclick={() => (showSettingsModal = true)}
          title={i18n.t('app.settings')}
          aria-label={i18n.t('app.settings')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path
              d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.35 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.97 19.05,5.05L16.56,5.9C16.04,5.53 15.47,5.22 14.86,5.03L14.49,2.37C14.45,2.13 14.24,1.95 14,1.95H10C13.76,1.95 13.55,2.13 13.51,2.37L13.14,5.03C12.53,5.22 11.96,5.53 11.44,5.9L8.95,5.05C8.73,4.97 8.46,5.05 8.34,5.27L6.34,8.73C6.22,8.95 6.27,9.22 6.46,9.37L8.57,11.03C8.53,11.35 8.5,11.67 8.5,12C8.5,12.33 8.53,12.65 8.57,12.97L6.46,14.63C6.27,14.78 6.22,15.05 6.34,15.27L8.34,18.73C8.46,18.95 8.73,19.03 8.95,18.95L11.44,18.1C11.96,18.47 12.53,18.78 13.14,18.97L13.51,21.63C13.55,21.87 13.76,22.05 14,22.05H10C10.24,22.05 10.45,21.87 10.49,21.63L10.86,18.97C11.47,18.78 12.04,18.47 12.56,18.1L15.05,18.95C15.27,19.03 15.54,18.95 15.66,18.73L17.66,15.27C17.78,15.05 17.73,14.78 17.54,14.63L19.43,12.97Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <div class="content-area">
    {#if view === 'weekly'}
      <WeeklyView
        startDate={selectedDate}
        {tasks}
        {weeklyTarget}
        onSlotClick={handleSlotClick}
        onTaskClick={handleTaskClick}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onNavigate={async (date) => {
          selectedDate = date;
          await loadTasks(true);
        }}
        onDayClick={(date) => {
          selectedDate = date;
          view = 'daily';
          loadTasks(true);
        }}
        onTaskCopyToRecents={async (task) => {
          await taskStore.upsertRecentTask(task);
        }}
      />
    {:else}
      <section class="daily-section">
        <div class="section-header">
          <h2>{i18n.t('daily.log')} - {selectedDate.toLocaleDateString()}</h2>
          <button class="add-btn" onclick={() => (showAddModal = true)}>
            {i18n.t('common.add')}
          </button>
        </div>
        <TaskList tasks={dailyTasks} />
      </section>
    {/if}
  </div>

  <div class="history-controls">
    <button
      onclick={handleUndo}
      disabled={historyStore.undoStack.length === 0}
      title={i18n.t('common.undo') + ' (Ctrl+Z)'}
      aria-label={i18n.t('common.undo')}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H10.6L7.38,12.77C8.77,11.66 10.55,11 12.5,11C16.04,11 19.05,13.05 20.5,16L22.5,15.2C20.69,11.25 16.89,8.5 12.5,8Z" />
      </svg>
    </button>
    <button
      onclick={handleRedo}
      disabled={historyStore.redoStack.length === 0}
      title={i18n.t('common.redo') + ' (Ctrl+Y)'}
      aria-label={i18n.t('common.redo')}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M18.4,10.6C16.55,9 14.15,8 11.5,8C7.11,8 3.31,11.25 1.5,15.2L3.5,16C4.95,13.05 7.96,11 11.5,11C13.45,11 15.23,11.66 16.62,12.77L13.4,16H22V7L18.4,10.6Z" />
      </svg>
    </button>
  </div>

  <Tutorial show={showTutorial} onClose={() => (showTutorial = false)} setView={(v) => (view = v)} />
</main>

<Modal
  show={showAddModal}
  title={editingTask ? i18n.t('task.form_title_edit') : i18n.t('task.form_title_add')}
  onClose={() => (showAddModal = false)}
>
  <TaskForm
    {taskStore}
    {editingTask}
    {initialStartTime}
    onSuccess={async () => {
      showAddModal = false;
      await loadTasks(true);
    }}
  />
</Modal>

<Modal
  show={showSettingsModal}
  title={i18n.t('settings.title')}
  onClose={() => (showSettingsModal = false)}
>
  <Settings {weeklyTarget} onSave={handleSaveSettings} />
</Modal>

<style>
  .app-container {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1.5rem;
    background-color: var(--md-sys-color-surface-container);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    flex-shrink: 0;
  }

  .logo h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--md-sys-color-primary);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-btns {
    display: flex;
    gap: 0.5rem;
  }

  .view-toggle {
    display: flex;
    background-color: var(--md-sys-color-surface-container-high);
    padding: 4px;
    border-radius: 20px;
  }

  .view-toggle button {
    padding: 6px 16px;
    border: none;
    background: none;
    border-radius: 16px;
    cursor: pointer;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
    transition: all 0.2s;
    white-space: nowrap;
  }

  .view-toggle button.active {
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  }

  .icon-btn {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .icon-btn:hover {
    background-color: var(--md-sys-color-surface-container-highest);
  }

  .content-area {
    flex: 1;
    overflow: hidden;
    padding: 1rem;
    position: relative;
  }

  .daily-section {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    overflow-y: auto;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .add-btn {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .add-btn:hover {
    opacity: 0.9;
  }

  .history-controls {
    position: fixed;
    bottom: 1.5rem;
    left: 1.5rem;
    display: flex;
    gap: 0.5rem;
    z-index: 100;
  }

  .history-controls button {
    background-color: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-primary);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
  }

  .history-controls button:hover:not(:disabled) {
    transform: scale(1.1);
    background-color: var(--md-sys-color-primary-container);
  }

  .history-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--md-sys-color-outline);
  }

  /* Media Queries for Mobile */
  @media (max-width: 600px) {
    .app-header {
      padding: 0.5rem 0.75rem;
    }

    .logo h1 {
      font-size: 1.2rem;
    }

    .header-actions {
      gap: 0.5rem;
    }

    .view-toggle button {
      padding: 4px 10px;
      font-size: 0.85rem;
    }

    .icon-btn {
      padding: 6px;
    }
  }

  @media (max-width: 400px) {
    .logo {
      display: none; /* Hide logo on very small screens to make room for toggle and buttons */
    }
  }
</style>
