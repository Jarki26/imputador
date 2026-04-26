<script lang="ts">
  import { onMount } from 'svelte';
  import { i18n } from './i18n.svelte';
  import { signalingService } from './signalingService';
  import { p2pConnection } from './p2pConnection';
  import { syncManager } from './syncManager';

  let localId = $state('');
  let remoteId = $state('');
  let isConnected = $state(p2pConnection.isConnected());
  let status = $state(isConnected ? 'connected' : 'disconnected');
  let copySuccess = $state(false);

  onMount(async () => {
    if (!signalingService.peer) {
      try {
        localId = await signalingService.initialize();
        p2pConnection.listen();
        syncManager.setupListeners();
      } catch (err) {
        console.error('Failed to initialize signaling:', err);
        status = 'error';
      }
    } else {
      localId = signalingService.peer.id;
    }
  });

  async function handleConnect() {
    if (!remoteId) return;
    try {
      status = 'syncing';
      await p2pConnection.connect(remoteId);
      isConnected = true;
      status = 'connected';
      await syncManager.sync();
    } catch (err) {
      console.error('Connection failed:', err);
      status = 'error';
    }
  }

  function handleDisconnect() {
    p2pConnection.disconnect();
    isConnected = false;
    status = 'disconnected';
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(localId);
    copySuccess = true;
    setTimeout(() => (copySuccess = false), 2000);
  }
</script>

<div class="sync-settings">
  <section class="settings-section">
    <h3>{i18n.t('settings.sync_title')}</h3>
    <p class="help-text">{i18n.t('settings.sync_help')}</p>

    <div class="form-group">
      <label for="localId">{i18n.t('settings.sync_local_id')}</label>
      <div class="id-container">
        <input type="text" id="localId" readonly value={localId} />
        <button
          class="icon-btn"
          title={copySuccess ? 'Copied!' : 'Copy'}
          onclick={copyToClipboard}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="status-indicator" class:connected={isConnected}>
      <span class="dot"></span>
      {isConnected
        ? i18n.t('settings.sync_status_connected')
        : i18n.t('settings.sync_status_disconnected')}
    </div>

    {#if !isConnected}
      <div class="form-group">
        <label for="remoteId">{i18n.t('settings.sync_remote_id')}</label>
        <input
          type="text"
          id="remoteId"
          bind:value={remoteId}
          placeholder="remote-peer-id"
        />
      </div>
      <button class="connect-btn" onclick={handleConnect} disabled={!localId}>
        {i18n.t('settings.sync_connect')}
      </button>
    {:else}
      <button class="disconnect-btn" onclick={handleDisconnect}>
        {i18n.t('settings.sync_disconnect')}
      </button>
    {/if}

    {#if status === 'error'}
      <p class="error-msg">{i18n.t('settings.sync_status_error')}</p>
    {/if}
  </section>
</div>

<style>
  .sync-settings {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--md-sys-color-surface-container-low);
    border-radius: 12px;
  }

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--md-sys-color-primary);
  }

  .help-text {
    font-size: 0.9rem;
    color: var(--md-sys-color-on-surface-variant);
    margin: 0;
    line-height: 1.4;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--md-sys-color-on-surface);
  }

  .id-container {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    font-family: monospace;
    font-size: 0.9rem;
  }

  .icon-btn {
    padding: 0.5rem;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    background: var(--md-sys-color-surface-container-highest);
  }

  .connect-btn,
  .disconnect-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 20px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .connect-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }

  .connect-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .disconnect-btn {
    background: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    background: var(--md-sys-color-surface-container-high);
    width: fit-content;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--md-sys-color-outline);
  }

  .connected .dot {
    background: #4caf50;
    box-shadow: 0 0 8px #4caf50;
  }

  .error-msg {
    color: var(--md-sys-color-error);
    font-size: 0.85rem;
    margin: 0;
  }
</style>
