<script lang="ts">
  import { i18n } from './i18n.svelte';

  let {
    startDate,
    onNavigate,
    totalBillableHours,
    effectiveGoal,
    remainingTime,
    progressPercentage,
    onSyncSesame,
    syncLoading = false,
    onOpenCalendar,
  }: {
    startDate: Date;
    onNavigate?: (date: Date) => void;
    totalBillableHours: number;
    effectiveGoal: number;
    remainingTime: number;
    progressPercentage: number;
    onSyncSesame?: () => void;
    syncLoading?: boolean;
    onOpenCalendar?: () => void;
  } = $props();
</script>

<div class="weekly-header">
  <div class="header-left">
    <div class="nav-controls">
      <button
        class="nav-btn"
        onclick={() => {
          const prev = new Date(startDate);
          prev.setDate(prev.getDate() - 7);
          if (onNavigate) onNavigate(prev);
        }}
        title={i18n.t('weekly.prev_week')}
        aria-label={i18n.t('weekly.prev_week')}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path
            d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
          />
        </svg>
      </button>

      <button
        class="nav-btn"
        onclick={onOpenCalendar}
        title={i18n.t('calendar.select_date')}
        aria-label={i18n.t('calendar.select_date')}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
        </svg>
      </button>

      <button
        class="nav-btn"
        onclick={() => {
          const next = new Date(startDate);
          next.setDate(next.getDate() + 7);
          if (onNavigate) onNavigate(next);
        }}
        title={i18n.t('weekly.next_week')}
        aria-label={i18n.t('weekly.next_week')}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
        </svg>
      </button>
    </div>

    {#if onSyncSesame}
      <button 
        class="sync-btn" 
        class:loading={syncLoading}
        onclick={onSyncSesame}
        disabled={syncLoading}
        title={i18n.t('settings.sesame_sync_button')}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12,18A6,6 0 0,1 6,12C6,11,6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15V18M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z" />
        </svg>
        <span>{i18n.t('settings.sesame_sync_button')}</span>
      </button>
    {/if}
  </div>
  <div class="summary-container">
    <div class="weekly-summary">
      {i18n.t('weekly.logged')}: {totalBillableHours.toFixed(2)}h / {i18n.t(
        'weekly.target',
      )}: {effectiveGoal.toFixed(2)}h | {i18n.t('weekly.remaining')}: {remainingTime.toFixed(
        2,
      )}h
    </div>
    <div
      class="progress-container"
      role="progressbar"
      aria-valuenow={progressPercentage.toFixed(2)}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="progress-bar" style="width: {progressPercentage}%"></div>
    </div>
  </div>
</div>

<style>
  .weekly-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--md-sys-color-primary-container);
    border-bottom: 1px solid var(--md-sys-color-outline);
    padding: 0 0.5rem;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-controls {
    display: flex;
    gap: 4px;
  }

  .nav-btn {
    background: none;
    border: none;
    color: var(--md-sys-color-on-primary-container);
    padding: 4px;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .nav-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .sync-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    border-radius: 20px;
    padding: 4px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .sync-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .sync-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .sync-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sync-btn.loading svg {
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .summary-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 0.5rem 0;
  }

  .weekly-summary {
    color: var(--md-sys-color-on-primary-container);
    font-weight: 600;
    text-align: center;
    font-size: 0.9rem;
  }

  .progress-container {
    width: 60%;
    height: 8px;
    background-color: var(--md-sys-color-surface-variant);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--md-sys-color-outline-variant);
  }

  .progress-bar {
    height: 100%;
    background-color: var(--md-sys-color-primary);
    transition: width 0.3s ease;
  }
</style>
