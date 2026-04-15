<script lang="ts">
  interface Props {
    value: string;
    onSelect?: (color: string) => void;
  }

  let { value = $bindable(), onSelect }: Props = $props();

  const palette = [
    '#e5e7eb', // gray-200 (Default)
    '#fecaca', // red-200
    '#fed7aa', // orange-200
    '#fef08a', // yellow-200
    '#bbf7d0', // green-200
    '#bfdbfe', // blue-200
    '#ddd6fe', // purple-200
    '#f5d0fe', // pink-200
    '#94a3b8', // slate-400
    '#fbbf24', // amber-400
    '#4ade80', // green-400
    '#60a5fa', // blue-400
    '#818cf8', // indigo-400
    '#a78bfa', // violet-400
    '#f472b6', // pink-400
    '#fb7185', // rose-400
  ];

  function selectColor(color: string) {
    value = color;
    onSelect?.(color);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    selectColor(target.value);
  }
</script>

<div class="color-picker">
  <div class="preview-row">
    <div
      class="color-preview"
      style:background-color={value}
      data-testid="color-preview"
    ></div>
    <div class="custom-input">
      <label for="custom-color">Custom Color</label>
      <div class="input-controls">
        <input
          id="custom-color"
          type="color"
          {value}
          oninput={handleInput}
        />
        <input
          type="text"
          {value}
          oninput={handleInput}
          placeholder="#RRGGBB"
          aria-label="Custom Color Text"
        />
      </div>
    </div>
  </div>

  <div class="palette">
    {#each palette as color}
      <button
        type="button"
        class="palette-color"
        class:selected={value === color}
        style:background-color={color}
        onclick={() => selectColor(color)}
        data-testid="palette-color"
        title={color}
      ></button>
    {/each}
  </div>
</div>

<style>
  .color-picker {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
    background: var(--md-sys-color-surface-container-low);
    border-radius: 0.5rem;
  }

  .preview-row {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .color-preview {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    border: 1px solid var(--md-sys-color-outline-variant);
    box-shadow: var(--md-sys-elevation-level-1);
    flex-shrink: 0;
  }

  .custom-input {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .custom-input label {
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .input-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .custom-input input[type="color"] {
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    flex-shrink: 0;
  }

  .custom-input input[type="text"] {
    width: 100%;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 0.25rem;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  .palette {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .palette-color {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.1s;
    padding: 0;
    flex-shrink: 0;
  }

  .palette-color:hover {
    transform: scale(1.1);
  }

  .palette-color.selected {
    border-color: var(--md-sys-color-primary);
    box-shadow: 0 0 0 2px var(--md-sys-color-surface);
  }
</style>
