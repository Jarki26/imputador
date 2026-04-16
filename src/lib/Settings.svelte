<script lang="ts">
  import { i18n } from './i18n.svelte';
  import ExportSettings from './ExportSettings.svelte';
  import CompanySettings from './CompanySettings.svelte';
  import TaskColorSettings from './TaskColorSettings.svelte';
  import BulkEdit from './BulkEdit.svelte';
  import BackupSettings from './BackupSettings.svelte';
  import type { ColumnMapping } from './exportConfigStore';
  import type { CompanyStore } from './companyStore';
  import type { TaskStore } from './taskStore';
  import type { ProjectStore } from './projectStore';

  interface Props {
    weeklyTarget: number;
    exportTemplate: ColumnMapping[];
    exportExclusions: string[];
    excelDateFormat: string;
    taskTypeColors: Record<string, string>;
    companyStore?: CompanyStore;
    taskStore?: TaskStore;
    projectStore?: ProjectStore;
    onSave: (target: number) => void;
    onSaveExportConfig: (data: {
      template: ColumnMapping[];
      exclusions: string[];
      excelDateFormat: string;
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
    taskTypeColors,
    companyStore,
    taskStore,
    projectStore,
    onSave,
    onSaveExportConfig,
    onSaveTaskTypeColor,
    onImportComplete,
    onBulkUpdate,
  }: Props = $props();

  let target = $state(weeklyTarget);
  let error = $state('');

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

<div class="settings-form">
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
    <select id="language" value={i18n.locale} onchange={handleLanguageChange}>
      {#each languages as lang}
        <option value={lang.code}>{lang.label}</option>
      {/each}
    </select>
  </div>

  <hr class="separator" />

  <ExportSettings
    template={exportTemplate}
    exclusions={exportExclusions}
    {excelDateFormat}
    onSave={onSaveExportConfig}
    {onImportComplete}
  />

  <hr class="separator" />

  <CompanySettings {companyStore} />

  <hr class="separator" />

  <TaskColorSettings colors={taskTypeColors} onSaveColor={onSaveTaskTypeColor} />

  <hr class="separator" />

  <BulkEdit {taskStore} {projectStore} {companyStore} onSuccess={onBulkUpdate} />

  <hr class="separator" />

  <BackupSettings />

  <div class="actions">
    <button class="save-btn" onclick={handleSave}>{i18n.t('common.save')}</button>
  </div>
</div>

<style>
  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
</style>
