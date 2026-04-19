<script lang="ts">
  import { i18n } from './i18n.svelte';
  import { SettingsService, type SettingsBackup } from './settingsService';

  let fileInput: HTMLInputElement;

  async function handleExport() {
    const service = new SettingsService();
    const data = await service.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    a.href = url;
    a.download = `imputador_settings_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function triggerImport() {
    fileInput.click();
  }

  async function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as SettingsBackup;

        if (confirm(i18n.t('settings.backup_confirm'))) {
          const service = new SettingsService();
          await service.importData(data);
          alert(i18n.t('settings.backup_success'));
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
        alert(
          i18n.t('settings.backup_error', { error: (err as Error).message }),
        );
      } finally {
        input.value = ''; // Reset input
      }
    };

    reader.readAsText(file);
  }
</script>

<div class="backup-settings">
  <h3>{i18n.t('settings.backup_restore')}</h3>

  <div class="backup-actions">
    <button class="btn secondary" onclick={handleExport}>
      <span class="icon">📥</span>
      {i18n.t('settings.export_settings')}
    </button>

    <button class="btn secondary" onclick={triggerImport}>
      <span class="icon">📤</span>
      {i18n.t('settings.import_settings')}
    </button>
  </div>

  <input
    type="file"
    accept=".json"
    bind:this={fileInput}
    onchange={handleImport}
    style="display: none;"
  />
</div>

<style>
  .backup-settings {
    background: var(--md-sys-color-surface-container-low);
    padding: 1rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h3 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    color: var(--md-sys-color-primary);
  }

  .backup-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:hover {
    background: var(--md-sys-color-surface-container-highest);
    border-color: var(--md-sys-color-primary);
  }

  .icon {
    font-size: 1.2rem;
  }
</style>
