import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import CompanySettings from './CompanySettings.svelte';
import { i18n } from './i18n.svelte';

describe('CompanySettings Component', () => {
  let mockCompanyStore: any;

  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    
    mockCompanyStore = {
      searchCompanies: vi.fn().mockResolvedValue([
        { name: 'Apple', useCount: 10, lastUsedAt: new Date() },
        { name: 'Google', useCount: 5, lastUsedAt: new Date() }
      ]),
      upsertCompany: vi.fn().mockResolvedValue(undefined),
      deleteCompany: vi.fn().mockResolvedValue(undefined),
      updateCompany: vi.fn().mockResolvedValue(undefined)
    };
  });

  it('should render the list of companies', async () => {
    render(CompanySettings, { props: { companyStore: mockCompanyStore } });
    
    await tick();
    await tick();

    expect(screen.getByText('Apple')).toBeDefined();
    expect(screen.getByText('Google')).toBeDefined();
    expect(screen.getByText('(10)')).toBeDefined();
  });

  it('should add a new company', async () => {
    render(CompanySettings, { props: { companyStore: mockCompanyStore } });
    
    const input = screen.getByPlaceholderText(/Nombre de la empresa/i);
    await fireEvent.input(input, { target: { value: 'New Co' } });
    
    const addBtn = screen.getByText(/Añadir/i);
    await fireEvent.click(addBtn);

    expect(mockCompanyStore.upsertCompany).toHaveBeenCalledWith('New Co');
  });

  it('should delete a company after confirmation', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    
    render(CompanySettings, { props: { companyStore: mockCompanyStore } });
    await tick();
    await tick();

    const deleteBtns = screen.getAllByTitle(/Eliminar/i);
    await fireEvent.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockCompanyStore.deleteCompany).toHaveBeenCalledWith('Apple');
  });

  it('should start editing a company', async () => {
    render(CompanySettings, { props: { companyStore: mockCompanyStore } });
    await tick();
    await tick();

    const editBtns = screen.getAllByTitle(/Actualizar/i);
    await fireEvent.click(editBtns[0]);

    const editInput = screen.getByDisplayValue('Apple');
    expect(editInput).toBeDefined();
  });

  it('should save updated company name', async () => {
    render(CompanySettings, { props: { companyStore: mockCompanyStore } });
    await tick();
    await tick();

    const editBtns = screen.getAllByTitle(/Actualizar/i);
    await fireEvent.click(editBtns[0]);

    const editInput = screen.getByDisplayValue('Apple');
    await fireEvent.input(editInput, { target: { value: 'Apple Inc' } });

    const saveBtn = screen.getByTitle(/Guardar/i);
    await fireEvent.click(saveBtn);

    expect(mockCompanyStore.updateCompany).toHaveBeenCalledWith('Apple', { name: 'Apple Inc' });
  });
});
