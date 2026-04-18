<script lang="ts">
  import { i18n } from './i18n.svelte';

  let {
    startDate,
    onNavigate,
    totalBillableHours,
    effectiveGoal,
    remainingTime,
    progressPercentage,
  }: {
    startDate: Date;
    onNavigate?: (date: Date) => void;
    totalBillableHours: number;
    effectiveGoal: number;
    remainingTime: number;
    progressPercentage: number;
  } = $props();
</script>

<div class="weekly-header">
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
