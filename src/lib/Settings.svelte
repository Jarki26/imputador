<script lang="ts">
  interface Props {
    weeklyTarget: number;
    onSave: (target: number) => void;
  }

  let { weeklyTarget, onSave }: Props = $props();

  let target = $state(weeklyTarget);
  let error = $state('');

  function handleSave() {
    if (target < 1 || target > 60) {
      error = 'Value must be between 1 and 60';
      return;
    }
    error = '';
    onSave(target);
  }
</script>

<div class="settings-form">
  <div class="form-group">
    <label for="weeklyTarget">Weekly Hours Target</label>
    <input
      type="number"
      id="weeklyTarget"
      bind:value={target}
      min="1"
      max="60"
      class:error={!!error}
    />
    {#if error}
      <p class="error-msg">{error}</p>
    {/if}
  </div>

  <div class="actions">
    <button class="save-btn" onclick={handleSave}>Save</button>
  </div>
</div>

<style>
  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    color: var(--md-sys-color-on-surface);
  }

  input {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    font-size: 1rem;
  }

  input.error {
    border-color: var(--md-sys-color-error);
  }

  .error-msg {
    color: var(--md-sys-color-error);
    font-size: 0.875rem;
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .save-btn {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save-btn:hover {
    background: var(--md-sys-color-primary-fixed);
    color: var(--md-sys-color-on-primary-fixed);
  }
</style>
