<script lang="ts">
  import { onMount } from 'svelte';
  import { CompanyStore } from './companyStore';
  import type { Company } from './db';
  import { i18n } from './i18n.svelte';

  interface Props {
    companyStore?: CompanyStore;
  }

  let { companyStore = new CompanyStore() }: Props = $props();

  let companies = $state<Company[]>([]);
  let newCompanyName = $state('');
  let editingCompanyName = $state<string | null>(null);
  let editValue = $state('');

  onMount(async () => {
    await loadCompanies();
  });

  async function loadCompanies() {
    // Get all companies, sorted by name for management
    const all = await companyStore.searchCompanies('');
    companies = all.sort((a, b) => a.name.localeCompare(b.name));
  }

  async function handleAdd() {
    if (!newCompanyName.trim()) return;
    await companyStore.upsertCompany(newCompanyName.trim());
    newCompanyName = '';
    await loadCompanies();
  }

  async function handleDelete(name: string) {
    if (confirm(i18n.t('settings.delete_company_confirm'))) {
      await companyStore.deleteCompany(name);
      await loadCompanies();
    }
  }

  function startEdit(company: Company) {
    editingCompanyName = company.name;
    editValue = company.name;
  }

  async function handleUpdate() {
    if (
      editingCompanyName &&
      editValue.trim() &&
      editingCompanyName !== editValue.trim()
    ) {
      await companyStore.updateCompany(editingCompanyName, {
        name: editValue.trim(),
      });
      editingCompanyName = null;
      await loadCompanies();
    } else {
      editingCompanyName = null;
    }
  }

  function handleKeyPress(e: KeyboardEvent, action: () => void) {
    if (e.key === 'Enter') {
      action();
    }
  }
</script>

<section class="company-settings">
  <h3>{i18n.t('settings.manage_companies_title')}</h3>

  <div class="add-company">
    <input
      type="text"
      bind:value={newCompanyName}
      placeholder={i18n.t('settings.company_name_placeholder')}
      onkeypress={(e) => handleKeyPress(e, handleAdd)}
    />
    <button
      onclick={handleAdd}
      class="add-btn"
      disabled={!newCompanyName.trim()}
    >
      {i18n.t('common.add')}
    </button>
  </div>

  <div class="company-list">
    {#if companies.length === 0}
      <p class="empty-msg">{i18n.t('settings.no_companies')}</p>
    {:else}
      {#each companies as company}
        <div class="company-item">
          {#if editingCompanyName === company.name}
            <input
              type="text"
              bind:value={editValue}
              onkeypress={(e) => handleKeyPress(e, handleUpdate)}
              autoFocus
            />
            <div class="item-actions">
              <button
                onclick={handleUpdate}
                class="icon-btn save"
                title={i18n.t('common.save')}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path
                    d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                  />
                </svg>
              </button>
              <button
                onclick={() => (editingCompanyName = null)}
                class="icon-btn cancel"
                title={i18n.t('common.cancel')}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </button>
            </div>
          {:else}
            <span class="name">{company.name}</span>
            <span class="stats">({company.useCount})</span>
            <div class="item-actions">
              <button
                onclick={() => startEdit(company)}
                class="icon-btn edit"
                title={i18n.t('common.update')}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path
                    d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
                  />
                </svg>
              </button>
              <button
                onclick={() => handleDelete(company.name)}
                class="icon-btn delete"
                title={i18n.t('common.delete')}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path
                    d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                  />
                </svg>
              </button>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</section>

<style>
  .company-settings {
    background: var(--md-sys-color-surface-container-low);
    padding: 1rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--md-sys-color-primary);
  }

  .add-company {
    display: flex;
    gap: 0.5rem;
  }

  .add-company input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  .add-btn {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .company-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .empty-msg {
    text-align: center;
    color: var(--md-sys-color-on-surface-variant);
    font-style: italic;
    margin: 1rem 0;
  }

  .company-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--md-sys-color-surface);
    border-radius: 8px;
    border: 1px solid var(--md-sys-color-outline-variant);
  }

  .company-item input {
    flex: 1;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--md-sys-color-primary);
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }

  .name {
    flex: 1;
    font-weight: 500;
  }

  .stats {
    font-size: 0.8rem;
    color: var(--md-sys-color-on-surface-variant);
  }

  .item-actions {
    display: flex;
    gap: 0.25rem;
  }

  .icon-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .icon-btn.edit:hover {
    background: var(--md-sys-color-surface-container-high);
  }
  .icon-btn.delete:hover {
    background: var(--md-sys-color-error-container);
    color: var(--md-sys-color-error);
  }
  .icon-btn.save {
    color: var(--md-sys-color-primary);
  }
  .icon-btn.save:hover {
    background: var(--md-sys-color-primary-container);
  }
  .icon-btn.cancel:hover {
    background: var(--md-sys-color-surface-container-high);
  }
</style>
