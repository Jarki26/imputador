<script lang="ts">
  import Modal from './Modal.svelte';
  import { i18n } from './i18n.svelte';

  let { onExport }: { onExport: (range: { startDate: string; endDate: string }) => void } = $props();

  let showModal = $state(false);
  let startDate = $state(new Date().toISOString().split('T')[0]);
  let endDate = $state(new Date().toISOString().split('T')[0]);

  function handleExport() {
    onExport({ startDate, endDate });
    showModal = false;
  }
</script>

<button class="export-trigger-btn" onclick={() => (showModal = true)}>
  {i18n.t('export.trigger')}
</button>

<Modal
  show={showModal}
  title={i18n.t('export.dialog_title')}
  onClose={() => (showModal = false)}
>
  <div class="export-dialog-content">
    <div class="form-group">
      <label for="start-date">{i18n.t('export.start_date')}</label>
      <input type="date" id="start-date" bind:value={startDate} />
    </div>

    <div class="form-group">
      <label for="end-date">{i18n.t('export.end_date')}</label>
      <input type="date" id="end-date" bind:value={endDate} />
    </div>

    <div class="actions">
      <button class="cancel-btn" onclick={() => (showModal = false)}>
        {i18n.t('common.cancel')}
      </button>
      <button class="export-btn" onclick={handleExport}>
        {i18n.t('export.action_export')}
      </button>
    </div>
  </div>
</Modal>

<style>
  .export-trigger-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
  }

  .export-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 250px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .form-group label {
    font-size: 0.9rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .form-group input {
    padding: 8px;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 4px;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .cancel-btn {
    background: none;
    border: 1px solid var(--md-sys-color-outline);
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    color: var(--md-sys-color-on-surface);
  }

  .export-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
  }
</style>
