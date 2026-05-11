<script lang="ts">
  import { i18n } from './i18n.svelte';
  import ExportSettings from './ExportSettings.svelte';
  import CompanySettings from './CompanySettings.svelte';
  import TaskColorSettings from './TaskColorSettings.svelte';
  import BulkEdit from './BulkEdit.svelte';
  import BackupSettings from './BackupSettings.svelte';
  import SesameSettings from './SesameSettings.svelte';
  import SyncSettings from './SyncSettings.svelte';
  import type { ColumnMapping } from './exportConfigStore';
  import type { CompanyStore } from './companyStore';
  import type { TaskStore } from './taskStore';
  import type { ProjectStore } from './projectStore';
  import type { ConfigStore } from './configStore';

  interface Props {
    weeklyTarget: number;
    exportTemplate: ColumnMapping[];
    exportExclusions: string[];
    excelDateFormat: string;
    excelFilenameFormat: string;
    excelSheetName: string;
    taskTypeColors: Record<string, string>;
    companyStore?: CompanyStore;
    taskStore?: TaskStore;
    projectStore?: ProjectStore;
    configStore?: ConfigStore;
    onSave: (target: number) => void;
    onSaveExportConfig: (data: {
      template: ColumnMapping[];
      exclusions: string[];
      excelDateFormat: string;
      excelFilenameFormat: string;
      excelSheetName: string;
    }) => void;
    onSaveTaskTypeColor: (taskType: string, color: string) => void;
    onImportComplete?: () => void;
    onBulkUpdate?: () => void;
  }

  let {
    weeklyTarget,
    exportTemplate,
    exportExclusions,
    excelDateFormat,
    excelFilenameFormat,
    excelSheetName,
    taskTypeColors,
    companyStore,
    taskStore,
    projectStore,
    configStore,
    onSave,
    onSaveExportConfig,
    onSaveTaskTypeColor,
    onImportComplete,
    onBulkUpdate,
  }: Props = $props();

  let target = $state(weeklyTarget);
  let error = $state('');
  let activeTab = $state('general');

  const languages = [
    { code: 'en', label: '🇬🇧 EN' },
    { code: 'es', label: '🇪🇸 ES' },
    { code: 'pt', label: '🇵🇹 PT' },
    { code: 'de', label: '🇩🇪 DE' },
    { code: 'fr', label: '🇫🇷 FR' },
    { code: 'zh', label: '🇨🇳 ZH' },
  ];

  function handleSave() {
    if (target < 1 || target > 60) {
      error = i18n.t('settings.value_error');
      return;
    }
    error = '';
    onSave(target);
  }

  function handleLanguageChange(e: Event) {
    const newLocale = (e.target as HTMLSelectElement).value;
    i18n.setLocale(newLocale);
  }
</script>

<div class="settings-container">
  <nav class="settings-sidebar">
    <button
      class="tab-btn"
      class:active={activeTab === 'general'}
      onclick={() => (activeTab = 'general')}
    >
      {i18n.t('settings.tabs.general')}
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'task_options'}
      onclick={() => (activeTab = 'task_options')}
    >
      {i18n.t('settings.tabs.task_options')}
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'data_management'}
      onclick={() => (activeTab = 'data_management')}
    >
      {i18n.t('settings.tabs.data_management')}
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'synchronization'}
      onclick={() => (activeTab = 'synchronization')}
    >
      {i18n.t('settings.tabs.synchronization')}
    </button>
    {#if configStore}
      <button
        class="tab-btn"
        class:active={activeTab === 'integrations'}
        onclick={() => (activeTab = 'integrations')}
      >
        {i18n.t('settings.tabs.integrations')}
      </button>
    {/if}
  </nav>

  <div class="settings-content">
    {#if activeTab === 'general'}
      <div class="tab-pane">
        <section class="settings-section">
          <h3>{i18n.t('settings.tabs.general')}</h3>
          <div class="form-group">
            <label for="weeklyTarget">{i18n.t('settings.weekly_target')}</label>
            <input
              type="number"
              id="weeklyTarget"
              bind:value={target}
              min="1"
              max="60"
              class:error={!!error}
            />
            {#if error}
              <p class="error-msg">{error}</p>
            {/if}
          </div>

          <div class="form-group">
            <label for="language">{i18n.t('settings.language')}</label>
            <select
              id="language"
              value={i18n.locale}
              onchange={handleLanguageChange}
            >
              {#each languages as lang}
                <option value={lang.code}>{lang.label}</option>
              {/each}
            </select>
          </div>
        </section>

        <hr class="separator" />

        <TaskColorSettings
          colors={taskTypeColors}
          onSaveColor={onSaveTaskTypeColor}
        />

        <div class="actions">
          <button class="save-btn" onclick={handleSave}
            >{i18n.t('common.save')}</button
          >
        </div>
      </div>
    {:else if activeTab === 'task_options'}
      <div class="tab-pane">
        <CompanySettings {companyStore} />
        <hr class="separator" />
        <BulkEdit
          {taskStore}
          {projectStore}
          {companyStore}
          onSuccess={onBulkUpdate}
        />
      </div>
    {:else if activeTab === 'data_management'}
      <div class="tab-pane">
        <ExportSettings
          template={exportTemplate}
          exclusions={exportExclusions}
          {excelDateFormat}
          {excelFilenameFormat}
          {excelSheetName}
          onSave={onSaveExportConfig}
          {onImportComplete}
        />
        <hr class="separator" />
        <BackupSettings />
      </div>
    {:else if activeTab === 'integrations' && configStore}
      <div class="tab-pane">
        <SesameSettings {configStore} />
      </div>
    {:else if activeTab === 'synchronization'}
      <div class="tab-pane">
        <SyncSettings />
      </div>
    {/if}
  </div>
</div>

<style>
  .settings-container {
    display: flex;
    gap: 2rem;
    min-height: 400px;
    height: 60vh;
  }

  .settings-sidebar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 200px;
    border-right: 1px solid var(--md-sys-color-outline-variant);
    padding-right: 1rem;
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .tab-pane {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    color: var(--md-sys-color-primary);
  }

  .tab-btn {
    text-align: left;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    background: var(--md-sys-color-surface-container-high);
  }

  .tab-btn.active {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    color: var(--md-sys-color-on-surface);
  }

  input,
  select {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    font-size: 1rem;
  }

  input.error {
    border-color: var(--md-sys-color-error);
  }

  .error-msg {
    color: var(--md-sys-color-error);
    font-size: 0.875rem;
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .save-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save-btn:hover {
    background: var(--md-sys-color-primary-fixed);
    color: var(--md-sys-color-on-primary-fixed);
  }

  .separator {
    border: none;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    margin: 0.5rem 0;
  }

  @media (max-width: 600px) {
    .settings-container {
      flex-direction: column;
      gap: 1rem;
      height: auto;
      min-height: auto;
    }

    .settings-sidebar {
      width: 100%;
      flex-direction: row;
      border-right: none;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      padding-right: 0;
      padding-bottom: 1rem;
      overflow-x: auto;
      white-space: nowrap;
    }

    .settings-sidebar::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      padding: 0.5rem 1rem;
    }
  }
</style>
