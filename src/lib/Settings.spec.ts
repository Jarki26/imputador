import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import Settings from './Settings.svelte';
import { i18n } from './i18n.svelte';
import type { ColumnMapping } from './exportConfigStore';

describe('Settings.svelte', () => {
  const defaultProps = {
    weeklyTarget: 41,
    exportTemplate: [] as ColumnMapping[],
    exportExclusions: [] as string[],
    excelDateFormat: 'DD/MM/YYYY',
    onSave: vi.fn(),
    onSaveExportConfig: vi.fn(),
  };

  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    await i18n.setLocale('es');
  });

  it('should render language selector', () => {
    render(Settings, { props: defaultProps });
    expect(screen.getByLabelText(/Idioma/i)).toBeDefined();
  });

  it('should update locale when language is changed', async () => {
    render(Settings, { props: defaultProps });
    
    const selector = screen.getByLabelText(/Idioma/i) as HTMLSelectElement;
    await fireEvent.change(selector, { target: { value: 'en' } });
    
    await waitFor(() => expect(i18n.locale).toBe('en'));
  });

  it('should render with default value of 41', () => {
    render(Settings, { props: defaultProps });
    const input = screen.getByLabelText(/Objetivo de Horas Semanales/i) as HTMLInputElement;
    expect(input.value).toBe('41');
  });

  it('should show error for value less than 1', async () => {
    const onSave = vi.fn();
    render(Settings, { props: { ...defaultProps, onSave } });
    
    const input = screen.getByLabelText(/Objetivo de Horas Semanales/i);
    await fireEvent.input(input, { target: { value: '0' } });
    
    const saveBtn = screen.getByRole('button', { name: /^Guardar$/i });
    await fireEvent.click(saveBtn);
    
    expect(await screen.findByText(/El valor debe estar entre 1 y 60/i)).toBeDefined();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should show error for value greater than 60', async () => {
    const onSave = vi.fn();
    render(Settings, { props: { ...defaultProps, onSave } });
    
    const input = screen.getByLabelText(/Objetivo de Horas Semanales/i);
    await fireEvent.input(input, { target: { value: '61' } });
    
    const saveBtn = screen.getByRole('button', { name: /^Guardar$/i });
    await fireEvent.click(saveBtn);
    
    expect(await screen.findByText(/El valor debe estar entre 1 y 60/i)).toBeDefined();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should call onSave with valid value', async () => {
    const onSave = vi.fn();
    render(Settings, { props: { ...defaultProps, onSave } });
    
    const input = screen.getByLabelText(/Objetivo de Horas Semanales/i);
    await fireEvent.input(input, { target: { value: '45' } });
    
    const saveBtn = screen.getByRole('button', { name: /^Guardar$/i });
    await fireEvent.click(saveBtn);
    
    expect(onSave).toHaveBeenCalledWith(45);
  });
});
