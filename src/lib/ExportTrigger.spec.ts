import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ExportTrigger from './ExportTrigger.svelte';
import { i18n } from './i18n.svelte';

describe('ExportTrigger.svelte', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    
    // Mock translations if not loaded
    i18n.setTranslations('es', {
      common: { cancel: 'Cancelar' },
      export: {
        trigger: 'Exportar Excel',
        dialog_title: 'Configurar Exportación',
        start_date: 'Fecha Inicio',
        end_date: 'Fecha Fin',
        action_export: 'Exportar'
      }
    });
  });

  it('should render the export button', () => {
    render(ExportTrigger);
    expect(screen.getByText(/Exportar Excel/i)).toBeDefined();
  });

  it('should open the dialog when clicked', async () => {
    render(ExportTrigger);
    const btn = screen.getByText(/Exportar Excel/i);
    await fireEvent.click(btn);

    expect(screen.getByText(/Configurar Exportación/i)).toBeDefined();
    expect(screen.getByLabelText(/Fecha Inicio/i)).toBeDefined();
    expect(screen.getByLabelText(/Fecha Fin/i)).toBeDefined();
  });

  it('should call the export function with selected dates', async () => {
    const onExport = vi.fn();
    render(ExportTrigger, { props: { onExport } });
    
    await fireEvent.click(screen.getByText(/Exportar Excel/i));

    const startInput = screen.getByLabelText(/Fecha Inicio/i) as HTMLInputElement;
    const endInput = screen.getByLabelText(/Fecha Fin/i) as HTMLInputElement;
    
    await fireEvent.input(startInput, { target: { value: '2026-04-01' } });
    await fireEvent.input(endInput, { target: { value: '2026-04-30' } });

    const exportBtn = screen.getByRole('button', { name: 'Exportar' });
    await fireEvent.click(exportBtn);

    expect(onExport).toHaveBeenCalledWith({
      startDate: '2026-04-01',
      endDate: '2026-04-30'
    });
  });

  it('should close the dialog when cancel is clicked', async () => {
    render(ExportTrigger);
    await fireEvent.click(screen.getByText(/Exportar Excel/i));
    
    const cancelBtn = screen.getByText(/Cancelar/i);
    await fireEvent.click(cancelBtn);

    expect(screen.queryByText(/Configurar Exportación/i)).toBeNull();
  });
});
