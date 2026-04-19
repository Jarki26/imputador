<script lang="ts">
  import { TASK_TYPES } from './config';
  import ColorPicker from './ColorPicker.svelte';
  import { i18n } from './i18n.svelte';

  interface Props {
    colors: Record<string, string>;
    onSaveColor: (taskType: string, color: string) => void;
  }

  let { colors, onSaveColor }: Props = $props();

  let expandedType = $state<string | null>(null);

  function toggleExpand(type: string) {
    if (expandedType === type) {
      expandedType = null;
    } else {
      expandedType = type;
    }
  }
</script>

<div class="task-color-settings">
  <h3>{i18n.t('settings.task_colors')}</h3>
  <div class="task-types-list">
    {#each TASK_TYPES as type}
      <div class="task-type-item">
        <button class="type-header" onclick={() => toggleExpand(type.name)}>
          <div
            class="color-dot"
            style:background-color={colors[type.name] ||
              type.defaultColor ||
              '#e5e7eb'}
          ></div>
          <span class="type-name">{type.name}</span>
          <span class="expand-icon"
            >{expandedType === type.name ? '−' : '+'}</span
          >
        </button>
        {#if expandedType === type.name}
          <div class="color-picker-wrapper">
            <ColorPicker
              value={colors[type.name] || type.defaultColor || '#e5e7eb'}
              onSelect={(color) => onSaveColor(type.name, color)}
            />
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .task-color-settings {
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

  .task-types-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .task-type-item {
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 0.5rem;
    background: var(--md-sys-color-surface-container-low);
  }

  .type-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--md-sys-color-surface-container);
    border: none;
    cursor: pointer;
    text-align: left;
    color: var(--md-sys-color-on-surface);
    font-family: inherit;
    font-size: 0.875rem;
  }

  .type-header:hover {
    background: var(--md-sys-color-surface-container-high);
  }

  .color-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 1px solid var(--md-sys-color-outline);
  }

  .type-name {
    flex: 1;
    font-weight: 500;
  }

  .expand-icon {
    font-size: 1.25rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .color-picker-wrapper {
    padding: 0.5rem;
    background: var(--md-sys-color-surface-container-low);
    border-top: 1px solid var(--md-sys-color-outline-variant);
  }
</style>
