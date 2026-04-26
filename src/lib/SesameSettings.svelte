<script lang="ts">
  import { i18n } from './i18n.svelte';
  import { sesameService } from './sesameService';
  import { onMount } from 'svelte';
  import type { ConfigStore } from './configStore';

  interface Props {
    configStore: ConfigStore;
  }

  let { configStore }: Props = $props();

  let email = $state('');
  let password = $state('');
  let proxyUrl = $state('');
  let loggedInEmail = $state<string | null>(null);
  let loading = $state(false);
  let error = $state('');
  let success = $state('');

  onMount(async () => {
    loggedInEmail = await configStore.getSesameEmail();
    proxyUrl = (await configStore.getSesameProxyUrl()) || '';
  });

  async function handleLogin() {
    if (!email || !password) return;

    loading = true;
    error = '';
    success = '';

    try {
      const token = await sesameService.login(email, password, proxyUrl);
      const user = await sesameService.getMe(token, proxyUrl);

      await configStore.setSesameToken(token);
      await configStore.setSesameUserId(user.id);
      await configStore.setSesameEmail(email);
      await configStore.setSesameProxyUrl(proxyUrl || null);

      loggedInEmail = email;
      success = i18n.t('settings.sesame_login_success');
      password = '';
    } catch (e: any) {
      error = i18n.t('settings.sesame_login_error', { error: e.message });
    } finally {
      loading = false;
    }
  }

  async function handleLogout() {
    await configStore.setSesameToken(null);
    await configStore.setSesameUserId(null);
    await configStore.setSesameEmail(null);
    loggedInEmail = null;
    success = '';
    error = '';
  }

  async function handleSaveProxy() {
    await configStore.setSesameProxyUrl(proxyUrl || null);
    success = i18n.t('common.save');
  }
</script>

<div class="sesame-settings">
  <h3>{i18n.t('settings.sesame_title')}</h3>

  <div class="proxy-config">
    <div class="form-group">
      <label for="sesame-proxy">{i18n.t('settings.sesame_proxy_url')}</label>
      <input
        type="url"
        id="sesame-proxy"
        bind:value={proxyUrl}
        placeholder={i18n.t('settings.sesame_proxy_placeholder')}
      />
      <span class="help-text">{i18n.t('settings.sesame_proxy_help')}</span>
    </div>
    {#if loggedInEmail}
      <button class="save-btn" onclick={handleSaveProxy}>
        {i18n.t('common.save')}
      </button>
    {/if}
  </div>

  <hr class="divider" />

  {#if loggedInEmail}
    <div class="logged-in">
      <p>{i18n.t('settings.sesame_logged_in_as', { email: loggedInEmail })}</p>
      <button class="logout-btn" onclick={handleLogout}>
        {i18n.t('settings.sesame_logout')}
      </button>
    </div>
  {:else}
    <div class="login-form">
      <div class="form-group">
        <label for="sesame-email">{i18n.t('settings.sesame_email')}</label>
        <input
          type="email"
          id="sesame-email"
          bind:value={email}
          placeholder="email@example.com"
        />
      </div>
      <div class="form-group">
        <label for="sesame-password">{i18n.t('settings.sesame_password')}</label
        >
        <input
          type="password"
          id="sesame-password"
          bind:value={password}
          placeholder="********"
        />
      </div>

      <button class="login-btn" onclick={handleLogin} disabled={loading}>
        {loading ? '...' : i18n.t('settings.sesame_login')}
      </button>
    </div>
  {/if}

  {#if error}
    <p class="error-msg">{error}</p>
  {/if}

  {#if success}
    <p class="success-msg">{success}</p>
  {/if}
</div>

<style>
  .sesame-settings {
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

  .login-form,
  .logged-in,
  .proxy-config {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .help-text {
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
    font-style: italic;
  }

  .divider {
    border: 0;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    margin: 0.5rem 0;
  }

  .save-btn {
    align-self: flex-end;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    border: 1px solid var(--md-sys-color-primary);
    background: transparent;
    color: var(--md-sys-color-primary);
    font-weight: 500;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  input {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  .login-btn,
  .logout-btn {
    padding: 0.75rem;
    border-radius: 20px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .login-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }

  .logout-btn {
    background: var(--md-sys-color-error-container);
    color: var(--md-sys-color-on-error-container);
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-msg {
    color: var(--md-sys-color-error);
    font-size: 0.875rem;
    margin: 0;
  }

  .success-msg {
    color: var(--md-sys-color-primary);
    font-size: 0.875rem;
    margin: 0;
  }
</style>
