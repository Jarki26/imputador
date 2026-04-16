import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import BulkEdit from './BulkEdit.svelte';
import { i18n } from './i18n.svelte';

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

  it('should render date range selectors', () => {
    render(BulkEdit);
    expect(screen.getByLabelText(/Fecha Inicio/i)).toBeDefined();
    expect(screen.getByLabelText(/Fecha Fin/i)).toBeDefined();
  });
});
