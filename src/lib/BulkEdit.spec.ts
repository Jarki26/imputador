import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import BulkEdit from './BulkEdit.svelte';
import { i18n } from './i18n.svelte';
import { formatDateOnlyForInput } from './utils';

describe('BulkEdit.svelte', () => {
  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    await i18n.setLocale('es');
  });

  it('should render the title', () => {
    render(BulkEdit);
    expect(screen.getByText(/Mantenimiento \/ Edición Masiva/i)).toBeDefined();
  });

  it('should have two tabs', () => {
    render(BulkEdit);
    expect(screen.getByText(/Renombrar Proyecto/i)).toBeDefined();
    expect(screen.getByText(/Actualización Masiva/i)).toBeDefined();
  });

  it('should render date range selectors with today as default', () => {
    render(BulkEdit);
    const today = formatDateOnlyForInput(new Date());
    const startInput = screen.getByLabelText(/Fecha Inicio/i) as HTMLInputElement;
    const endInput = screen.getByLabelText(/Fecha Fin/i) as HTMLInputElement;
    expect(startInput.value).toBe(today);
    expect(endInput.value).toBe(today);
  });
});
