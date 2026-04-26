<script lang="ts">
  import { p2pConnection } from './p2pConnection.svelte';
  import { syncManager } from './syncManager';
  import { i18n } from './i18n.svelte';

  const isConnected = $derived(p2pConnection.isConnected());
  const hasPending = $derived(syncManager.hasPendingSync());
</script>

<div class="sync-status" title={isConnected ? i18n.t('settings.sync_status_connected') : i18n.t('settings.sync_status_disconnected')}>
  <div class="icon-container" class:connected={isConnected} class:pending={hasPending}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 2v6h-6"></path>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
      <path d="M3 22v-6h6"></path>
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
    </svg>
    {#if hasPending}
      <span class="badge">!</span>
    {/if}
  </div>
</div>

<style>
  .sync-status {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    cursor: pointer;
  }

  .icon-container {
    position: relative;
    color: var(--md-sys-color-outline);
    transition: all 0.3s ease;
  }

  .icon-container.connected {
    color: #4caf50;
  }

  .icon-container.pending {
    color: var(--md-sys-color-warning, #ff9800);
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--md-sys-color-error);
    color: white;
    font-size: 10px;
    font-weight: bold;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 4px rgba(0,0,0,0.3);
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .icon-container.connected svg {
    /* animation: rotate 4s linear infinite; */
  }
</style>
