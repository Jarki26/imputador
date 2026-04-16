<script lang="ts">
  import { i18n } from './i18n.svelte';
  import { formatDateOnlyForInput } from './utils';

  let activeTab = $state('rename');
  let startDate = $state(formatDateOnlyForInput(new Date()));
  let endDate = $state(formatDateOnlyForInput(new Date()));
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
        <!-- Rename Project UI will go here -->
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
    padding: 1rem;
    background: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
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
  }
</style>
