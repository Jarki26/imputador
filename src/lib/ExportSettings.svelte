<script lang="ts">
  import { TASK_TYPES } from './config';
  import type { ColumnMapping } from './exportConfigStore';
  import { i18n } from './i18n.svelte';
  import { ImportService } from './importService';
  import Modal from './Modal.svelte';

  let {
    template = [],
    exclusions = [],
    onSave,
  }: {
    template: ColumnMapping[];
    exclusions: string[];
    onSave: (data: { template: ColumnMapping[]; exclusions: string[] }) => void;
  } = $props();

  const importService = new ImportService();
  let fileInput: HTMLInputElement;
  let showConfirmWipe = $state(false);
  let confirmText = $state('');
  let parsedTasks = $state<any[]>([]);
  let importErrors = $state<any[]>([]);

  let showResults = $state(false);
  let importResults = $state<{ successCount: number; errorCount: number } | null>(null);

  function handleImportClick() {
    fileInput.click();
  }

  async function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const result = await importService.parseFile(file, template);
    parsedTasks = result.tasks;
    importErrors = result.errors;
    
    showConfirmWipe = true;
    confirmText = '';
    // Reset file input so same file can be selected again
    (e.target as HTMLInputElement).value = '';
  }

  async function confirmImport() {
    if (confirmText !== 'IMPORTAR') return;
    
    const results = await importService.importTasks(parsedTasks);
    importResults = results;
    showConfirmWipe = false;
    showResults = true;
  }

  let localTemplate = $state([...template]);
  let localExclusions = $state([...exclusions]);

  // Standard task fields for mapping
  const taskFields: ColumnMapping['taskField'][] = [
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'title',
    'project',
    'company',
    'type',
    'description',
    'duration',
  ];

  // Use task types from config for exclusions
  const commonTaskTypes = TASK_TYPES.map((t) => t.name);

  function addMapping() {
    localTemplate.push({ columnName: '', taskField: 'project' });
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
    onSave({
      template: $state.snapshot(localTemplate),
      exclusions: $state.snapshot(localExclusions),
    });
  }

  $effect(() => {
    console.log('ExportSettings rendered with template:', localTemplate);
  });
</script>

<div class="export-settings">
  <section class="template-section">
    <h3>
      {i18n.t('settings.export_template_title') || 'Plantilla de Exportación'}
    </h3>
    <div class="mapping-list">
      {#each localTemplate as mapping, i}
        <div class="mapping-row">
          <input
            type="text"
            bind:value={mapping.columnName}
            placeholder={i18n.t('settings.column_name_placeholder') ||
              'Nombre Columna'}
            class="column-input"
          />

          <select bind:value={mapping.taskField} class="field-select">
            {#each taskFields as field}
              <option value={field}>{field}</option>
            {/each}
            <option value={undefined}>[Valor Fijo]</option>
          </select>

          {#if mapping.taskField === undefined}
            <input
              type="text"
              bind:value={mapping.fixedValue}
              placeholder="Valor fijo"
              class="fixed-input"
            />
          {/if}

          <button
            onclick={() => removeMapping(i)}
            title="Eliminar"
            class="delete-btn"
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
    <button onclick={addMapping} class="add-btn">
      + {i18n.t('settings.add_column') || 'Añadir Columna'}
    </button>
  </section>

  <section class="exclusions-section">
    <h3>
      {i18n.t('settings.export_exclusions_title') || 'Excluir Tipos de Tarea'}
    </h3>
    <div class="exclusions-list">
      {#each commonTaskTypes as type}
        <label class="exclusion-item">
          <input
            type="checkbox"
            checked={localExclusions.includes(type)}
            onchange={() => toggleExclusion(type)}
          />
          <span>{type}</span>
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
    <button onclick={handleImportClick} class="import-btn">
      {i18n.t('settings.import_file') || 'Importar Archivo'}
    </button>
    <button onclick={handleSave} class="save-btn">
      {i18n.t('settings.save_export_config') || 'Guardar Configuración'}
    </button>
  </div>

  <Modal
    show={showConfirmWipe}
    title={i18n.t('settings.import_confirm_title')}
    onClose={() => (showConfirmWipe = false)}
  >
    <div class="confirm-dialog">
      <p class="warning">
        {i18n.t('settings.import_confirm_msg')}
      </p>
      <input
        type="text"
        bind:value={confirmText}
        placeholder="IMPORTAR"
        class="confirm-input"
      />
      <div class="confirm-actions">
        <button class="cancel-btn" onclick={() => (showConfirmWipe = false)}>
          {i18n.t('common.cancel')}
        </button>
        <button
          class="confirm-btn"
          onclick={confirmImport}
          disabled={confirmText !== 'IMPORTAR'}
        >
          {i18n.t('settings.import_file')}
        </button>
      </div>
    </div>
  </Modal>

  <Modal
    show={showResults}
    title={i18n.t('settings.import_success_title')}
    onClose={() => (showResults = false)}
  >
    <div class="results-dialog">
      <p>
        {i18n.t('settings.import_results')
          .replace('{success}', String(importResults?.successCount || 0))
          .replace('{errors}', String(importResults?.errorCount || 0))}
      </p>
      {#if importErrors.length > 0}
        <div class="error-list">
          <h4>Errores detallados:</h4>
          <ul>
            {#each importErrors as error}
              <li>Fila {error.row + 1}: {error.message}</li>
            {/each}
          </ul>
        </div>
      {/if}
      <div class="confirm-actions">
        <button class="confirm-btn" onclick={() => (showResults = false)}>
          {i18n.t('common.close')}
        </button>
      </div>
    </div>
  </Modal>
</div>

<style>
  .export-settings {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
    background: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
  }

  section h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: var(--md-sys-color-primary);
  }

  .mapping-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .mapping-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .column-input,
  .field-select,
  .fixed-input {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  .column-input {
    flex: 2;
  }
  .field-select {
    flex: 1;
  }
  .fixed-input {
    flex: 1;
  }

  .delete-btn {
    background: none;
    border: none;
    color: var(--md-sys-color-error);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 50%;
  }

  .delete-btn:hover {
    background: var(--md-sys-color-error-container);
  }

  .add-btn {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
  }

  .exclusions-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .exclusion-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    padding-top: 1rem;
  }

  .import-btn {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    border: none;
    padding: 10px 24px;
    border-radius: 24px;
    cursor: pointer;
    font-weight: 600;
  }

  .save-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    padding: 10px 24px;
    border-radius: 24px;
    cursor: pointer;
    font-weight: 600;
  }

  .confirm-dialog {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.5rem;
    max-width: 400px;
  }

  .warning {
    color: var(--md-sys-color-error);
    font-weight: 500;
    margin: 0;
  }

  .confirm-input {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    text-align: center;
    font-weight: bold;
    letter-spacing: 2px;
  }

  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .cancel-btn {
    background: none;
    border: 1px solid var(--md-sys-color-outline);
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    color: var(--md-sys-color-on-surface);
  }

  .confirm-btn {
    background: var(--md-sys-color-error);
    color: var(--md-sys-color-on-error);
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
  }

  .confirm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .results-dialog {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 300px;
  }

  .error-list {
    max-height: 200px;
    overflow-y: auto;
    background: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
    padding: 1rem;
    border-radius: 8px;
  }

  .error-list h4 {
    margin-top: 0;
  }

  .error-list ul {
    margin: 0;
    padding-left: 1.5rem;
  }
</style>
