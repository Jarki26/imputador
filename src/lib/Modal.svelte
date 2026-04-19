<script lang="ts">
  import type { Snippet } from 'svelte';
  import { i18n } from './i18n.svelte';

  interface Props {
    show: boolean;
    title: string;
    onClose: () => void;
    children?: Snippet;
  }

  let { show = false, title, onClose, children }: Props = $props();

  let mouseDownOnBackdrop = false;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && show) {
      onClose();
    }
  }

  function handleBackdropMouseDown(e: MouseEvent) {
    mouseDownOnBackdrop = e.target === e.currentTarget;
  }

  function handleBackdropMouseUp(e: MouseEvent) {
    if (mouseDownOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
    mouseDownOnBackdrop = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <div
    class="modal-backdrop"
    onmousedown={handleBackdropMouseDown}
    onmouseup={handleBackdropMouseUp}
    role="presentation"
  >
    <div
      class="modal-content"
      onmousedown={(e) => e.stopPropagation()}
      onmouseup={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button
          class="close-btn"
          onclick={onClose}
          aria-label={i18n.t('common.close')}>×</button
        >
      </div>
      <div class="modal-body">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    padding: 1.5rem;
    border-radius: 1rem;
    min-width: 300px;
    max-width: 90%;
    max-height: 90dvh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant);
  }

  .modal-body {
    line-height: 1.5;
  }
</style>
