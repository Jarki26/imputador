<script lang="ts">
  import { i18n } from './i18n.svelte';
  import { formatDateOnlyForInput, parseStartDate, parseEndDate } from './utils';
  import Autocomplete from './Autocomplete.svelte';
  import { TaskStore } from './taskStore';
  import { ProjectStore } from './projectStore';
  import type { Project } from './db';

  interface Props {
    taskStore?: TaskStore;
    projectStore?: ProjectStore;
  }

  let {
    taskStore = new TaskStore(),
    projectStore = new ProjectStore(),
  }: Props = $props();

  let activeTab = $state('rename');
  let startDate = $state(formatDateOnlyForInput(new Date()));
  let endDate = $state(formatDateOnlyForInput(new Date()));

  // Rename Project State
  let sourceProject = $state('');
  let targetProject = $state('');
  let affectedCount = $state<number | null>(null);
  let projectSuggestions = $state<Project[]>([]);

  $effect(() => {
    projectStore.getRecentProjects(20).then((projects) => {
      projectSuggestions = projects;
    });
  });

  async function calculateRename() {
    const start = parseStartDate(startDate);
    const end = parseEndDate(endDate);
    const tasks = await taskStore.getTasksForRange(start, end);
    affectedCount = tasks.filter((t) => t.project === sourceProject).length;
  }

  async function applyRename() {
    if (affectedCount === null || affectedCount === 0) return;
    if (!confirm(i18n.t('bulk_edit.confirm_msg', { count: affectedCount.toString() }))) return;

    const start = parseStartDate(startDate);
    const end = parseEndDate(endDate);
    
    await taskStore.bulkUpdate(start, end, { project: sourceProject }, { project: targetProject });
    await projectStore.renameProject(sourceProject, targetProject);
    
    alert(i18n.t('bulk_edit.success', { count: affectedCount.toString() }));
    affectedCount = null;
    sourceProject = '';
    targetProject = '';
  }
</script>

<div class="bulk-edit">
  <h3>{i18n.t('bulk_edit.title')}</h3>

  <div class="date-range">
    <div class="form-group">
      <label for="startDate">{i18n.t('bulk_edit.start_date')}</label>
      <input type="date" id="startDate" bind:value={startDate} />
    </div>
    <div class="form-group">
      <label for="endDate">{i18n.t('bulk_edit.end_date')}</label>
      <input type="date" id="endDate" bind:value={endDate} />
    </div>
  </div>

  <div class="tabs">
    <button
      class:active={activeTab === 'rename'}
      onclick={() => (activeTab = 'rename')}
    >
      {i18n.t('bulk_edit.rename_project_tab')}
    </button>
    <button
      class:active={activeTab === 'mass'}
      onclick={() => (activeTab = 'mass')}
    >
      {i18n.t('bulk_edit.mass_update_tab')}
    </button>
  </div>

  <div class="tab-content">
    {#if activeTab === 'rename'}
      <div class="rename-project">
        <Autocomplete
          id="sourceProject"
          label={i18n.t('bulk_edit.source_project')}
          bind:value={sourceProject}
          suggestions={projectSuggestions}
          placeholder={i18n.t('task.project')}
        />
        <Autocomplete
          id="targetProject"
          label={i18n.t('bulk_edit.target_project')}
          bind:value={targetProject}
          suggestions={projectSuggestions}
          placeholder={i18n.t('task.project')}
        />
        
        <div class="actions">
          <button class="calc-btn" onclick={calculateRename} disabled={!sourceProject || !targetProject}>
            {i18n.t('bulk_edit.calculate')}
          </button>
        </div>

        {#if affectedCount !== null}
          <div class="preview">
            <p>{i18n.t('bulk_edit.affected_tasks', { count: affectedCount.toString() })}</p>
            {#if affectedCount > 0}
              <button class="apply-btn" onclick={applyRename}>
                {i18n.t('bulk_edit.apply')}
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <div class="mass-update">
        <!-- Mass Update UI will go here -->
      </div>
    {/if}
  </div>
</div>

<style>
  .bulk-edit {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
    border: 1px solid var(--md-sys-color-outline-variant);
  }

  .date-range {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  input {
    padding: 0.75rem;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 8px;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
  }

  .tabs button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    background: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
  }

  .tabs button.active {
    color: var(--md-sys-color-primary);
    border-bottom-color: var(--md-sys-color-primary);
  }

  .tab-content {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  .rename-project {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .calc-btn {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
  }

  .calc-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--md-sys-color-surface-container-highest);
    border-radius: 8px;
  }

  .apply-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
  }
</style>
