<script lang="ts">
  import { TASK_TYPES } from './config';
  import type { ColumnMapping } from './exportConfigStore';
  import { i18n } from './i18n.svelte';
  import { ImportService } from './importService';
  import Modal from './Modal.svelte';

  let {
    template = [],
    exclusions = [],
    excelDateFormat = 'DD/MM/YYYY',
    excelFilenameFormat = 'imputador_{START_YYYY}{START_MM}{START_DD}_{END_YYYY}{END_MM}{END_DD}',
    onSave,
    onImportComplete,
  }: {
    template: ColumnMapping[];
    exclusions: string[];
    excelDateFormat: string;
    excelFilenameFormat: string;
    onSave: (data: {
      template: ColumnMapping[];
      exclusions: string[];
      excelDateFormat: string;
      excelFilenameFormat: string;
    }) => void;
    onImportComplete?: () => void;
  } = $props();

  const importService = new ImportService();
  let fileInput: HTMLInputElement;
  let showConfirmWipe = $state(false);
  let confirmText = $state('');
  let parsedTasks = $state<any[]>([]);
  let importErrors = $state<any[]>([]);

  let showResults = $state(false);
  let importResults = $state<{
    successCount: number;
    errorCount: number;
  } | null>(null);

  function handleImportClick() {
    fileInput.click();
  }

  async function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const result = await importService.parseFile(
      file,
      template,
      localExcelDateFormat,
    );
    parsedTasks = result.tasks;
    importErrors = result.errors;
    showConfirmWipe = true;
    // Reset input
    (e.target as HTMLInputElement).value = '';
  }

  async function confirmImport() {
    if (confirmText !== 'IMPORTAR') return;
    const result = await importService.importTasks(parsedTasks);
    importResults = result;
    showConfirmWipe = false;
    confirmText = '';
    showResults = true;
    if (onImportComplete) onImportComplete();
  }

  // Local state for editing
  let localTemplate = $state<ColumnMapping[]>([]);
  let localExclusions = $state<string[]>([]);
  let localExcelDateFormat = $state('');
  let localExcelFilenameFormat = $state('');

  let filenameError = $derived.by(() => {
    const invalidChars = /[\\/:*?"<>|]/;
    return invalidChars.test(localExcelFilenameFormat);
  });

  $effect(() => {
    localTemplate = JSON.parse(JSON.stringify(template));
    localExclusions = [...exclusions];
    localExcelDateFormat = excelDateFormat;
    localExcelFilenameFormat = excelFilenameFormat;
  });

  function addMapping() {
    localTemplate.push({ columnName: '', taskField: 'title' });
  }

  function removeMapping(index: number) {
    localTemplate.splice(index, 1);
  }

  function toggleExclusion(type: string) {
    if (localExclusions.includes(type)) {
      localExclusions = localExclusions.filter((t) => t !== type);
    } else {
      localExclusions.push(type);
    }
  }

  function handleSave() {
    if (filenameError) return;
    onSave({
      template: $state.snapshot(localTemplate),
      exclusions: $state.snapshot(localExclusions),
      excelDateFormat: localExcelDateFormat,
      excelFilenameFormat: localExcelFilenameFormat,
    });
  }
</script>

<div class="export-settings">
  <section class="date-format-section">
    <h3>{i18n.t('settings.excel_date_format_title')}</h3>
    <div class="format-input-container">
      <input
        type="text"
        bind:value={localExcelDateFormat}
        class="date-format-input"
        placeholder="DD/MM/YYYY"
      />
      <p class="hint">{i18n.t('settings.excel_date_format_hint')}</p>
    </div>
  </section>

  <section class="filename-format-section">
    <h3>{i18n.t('settings.excel_filename_format_title')}</h3>
    <div class="format-input-container">
      <input
        type="text"
        bind:value={localExcelFilenameFormat}
        class="filename-format-input"
        class:error={filenameError}
        placeholder={'imputador_export_{START_YYYY}'}
        aria-label={i18n.t('settings.excel_filename_format_title')}
      />
      {#if filenameError}
        <p class="error-msg">{i18n.t('settings.excel_filename_error')}</p>
      {:else}
        <p class="hint">{i18n.t('settings.excel_filename_format_hint')}</p>
      {/if}
    </div>
  </section>

  <section class="template-section">
    <h3>{i18n.t('settings.export_template_title')}</h3>
    <div class="mapping-list">
      {#each localTemplate as mapping, i}
        <div class="mapping-item">
          <input
            type="text"
            bind:value={mapping.columnName}
            placeholder={i18n.t('settings.column_name_placeholder')}
          />
          <select bind:value={mapping.taskField}>
            <option value="startDate">{i18n.t('task.date')} (Inicio)</option>
            <option value="startTime">{i18n.t('task.start_time')}</option>
            <option value="endDate">{i18n.t('task.date')} (Fin)</option>
            <option value="endTime">{i18n.t('task.end_time')}</option>
            <option value="title">{i18n.t('task.title')}</option>
            <option value="project">{i18n.t('task.project')}</option>
            <option value="company">{i18n.t('task.company')}</option>
            <option value="type">{i18n.t('task.type')}</option>
            <option value="description">{i18n.t('task.description')}</option>
            <option value="duration">Duración (h)</option>
            <option value={undefined}>-- Valor Fijo --</option>
          </select>
          {#if mapping.taskField === undefined}
            <input
              type="text"
              bind:value={mapping.fixedValue}
              placeholder="Valor fijo"
            />
          {/if}
          <button
            class="delete-btn"
            onclick={() => removeMapping(i)}
            title={i18n.t('common.delete')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path
                d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
              />
            </svg>
          </button>
        </div>
      {/each}
    </div>
    <button class="add-btn" onclick={addMapping}>
      + {i18n.t('settings.add_column')}
    </button>
  </section>

  <section class="exclusions-section">
    <h3>{i18n.t('settings.export_exclusions_title')}</h3>
    <div class="exclusions-list">
      {#each TASK_TYPES as type}
        <label class="exclusion-item">
          <input
            type="checkbox"
            checked={localExclusions.includes(type.name)}
            onchange={() => toggleExclusion(type.name)}
          />
          <span>{type.name}</span>
        </label>
      {/each}
    </div>
  </section>

  <div class="actions">
    <input
      type="file"
      accept=".xlsx,.xls,.csv"
      bind:this={fileInput}
      onchange={handleFileChange}
      style="display: none"
    />
    <button class="import-btn" onclick={handleImportClick}>
      {i18n.t('settings.import_file')}
    </button>
    <button class="save-btn" onclick={handleSave} disabled={filenameError}>
      {i18n.t('settings.save_export_config')}
    </button>
  </div>

  {#if showConfirmWipe}
    <Modal
      title={i18n.t('settings.import_confirm_title')}
      onClose={() => (showConfirmWipe = false)}
    >
      <div class="confirm-wipe">
        <p>{i18n.t('settings.import_confirm_msg')}</p>
        <input
          type="text"
          bind:value={confirmText}
          placeholder="IMPORTAR"
          class="confirm-input"
        />
        {#if importErrors.length > 0}
          <div class="import-warnings">
            <h4>{i18n.t('settings.import_date_warning_title')}</h4>
            <p>
              {i18n.t('settings.import_date_warning_msg', {
                format: localExcelDateFormat,
              })}
            </p>
          </div>
        {/if}
        <div class="modal-actions">
          <button class="cancel-btn" onclick={() => (showConfirmWipe = false)}>
            {i18n.t('common.cancel')}
          </button>
          <button
            class="confirm-btn"
            disabled={confirmText !== 'IMPORTAR'}
            onclick={confirmImport}
          >
            {i18n.t('settings.import_file')}
          </button>
        </div>
      </div>
    </Modal>
  {/if}

  {#if showResults && importResults}
    <Modal
      title={i18n.t('settings.import_success_title')}
      onClose={() => (showResults = false)}
    >
      <div class="import-results">
        <p>
          {i18n.t('settings.import_results', {
            success: importResults.successCount,
            errors: importResults.errorCount,
          })}
        </p>
        <div class="modal-actions">
          <button class="save-btn" onclick={() => (showResults = false)}>
            {i18n.t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  {/if}
</div>

<style>
  .export-settings {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  section h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: var(--md-sys-color-on-surface);
  }

  .format-input-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-format-input,
  .filename-format-input {
    padding: 0.75rem;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    width: 100%;
    max-width: 400px;
  }

  .filename-format-input.error {
    border-color: var(--md-sys-color-error);
    outline-color: var(--md-sys-color-error);
  }

  .error-msg {
    margin: 0;
    font-size: 0.85rem;
    color: var(--md-sys-color-error);
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .mapping-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .mapping-item {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .mapping-item input,
  .mapping-item select {
    padding: 0.5rem;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 0.25rem;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  .mapping-item input {
    flex: 1;
  }

  .delete-btn {
    background: none;
    border: none;
    color: var(--md-sys-color-error);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    border-radius: 50%;
  }

  .delete-btn:hover {
    background-color: var(--md-sys-color-error-container);
  }

  .add-btn {
    background: none;
    border: 1px dashed var(--md-sys-color-primary);
    color: var(--md-sys-color-primary);
    padding: 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    width: 100%;
  }

  .add-btn:hover {
    background-color: var(--md-sys-color-primary-container);
  }

  .exclusions-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem;
  }

  .exclusion-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--md-sys-color-outline-variant);
  }

  .save-btn {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 2rem;
    cursor: pointer;
    font-weight: 500;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .import-btn {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 2rem;
    cursor: pointer;
    font-weight: 500;
  }

  .confirm-wipe {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .confirm-input {
    padding: 0.75rem;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 0.5rem;
    font-size: 1rem;
    text-align: center;
    letter-spacing: 0.2rem;
  }

  .import-warnings {
    background-color: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .import-warnings h4 {
    margin: 0 0 0.5rem 0;
  }

  .import-warnings p {
    margin: 0;
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }

  .cancel-btn {
    background: none;
    border: none;
    color: var(--md-sys-color-primary);
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-weight: 500;
  }

  .confirm-btn {
    background-color: var(--md-sys-color-error);
    color: var(--md-sys-color-on-error);
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
  }

  .confirm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
