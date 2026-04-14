<script lang="ts">
  interface Suggestion {
    name: string;
    useCount?: number;
  }

  interface Props {
    id: string;
    label: string;
    value: string;
    suggestions: Suggestion[];
    required?: boolean;
    placeholder?: string;
  }

  let {
    id,
    label,
    value = $bindable(),
    suggestions = [],
    required = false,
    placeholder = '',
  }: Props = $props();

  let showSuggestions = $state(false);
  let filter = $state('');
  let inputElement = $state<HTMLInputElement | null>(null);

  let filteredSuggestions = $derived(
    suggestions
      .filter((s) => s.name.toLowerCase().includes(value.toLowerCase()))
      .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
      .slice(0, 10),
  );

  function selectSuggestion(name: string) {
    value = name;
    showSuggestions = false;
  }

  function handleBlur() {
    // Delay hiding to allow click events on suggestions to fire
    setTimeout(() => {
      showSuggestions = false;
    }, 200);
  }
</script>

<div class="autocomplete-container">
  <label for={id}>{label}</label>
  <div class="input-wrapper">
    <input
      {id}
      type="text"
      {required}
      {placeholder}
      bind:value
      bind:this={inputElement}
      onfocus={() => (showSuggestions = true)}
      onblur={handleBlur}
      autocomplete="off"
    />
    {#if showSuggestions && filteredSuggestions.length > 0}
      <ul class="suggestions-list">
        {#each filteredSuggestions as suggestion}
          <li>
            <button type="button" onmousedown={() => selectSuggestion(suggestion.name)}>
              {suggestion.name}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .autocomplete-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: relative;
    width: 100%;
  }

  .input-wrapper {
    position: relative;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 0.25rem;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    font-family: inherit;
    box-sizing: border-box;
  }

  input:focus {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: -1px;
  }

  .suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--md-sys-color-surface-container-high);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 0 0 0.5rem 0.5rem;
    box-shadow: var(--md-sys-elevation-level-2);
    margin: 0;
    padding: 0.5rem 0;
    list-style: none;
    max-height: 200px;
    overflow-y: auto;
  }

  .suggestions-list li button {
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.875rem;
  }

  .suggestions-list li button:hover {
    background: var(--md-sys-color-surface-container-highest);
  }
</style>
