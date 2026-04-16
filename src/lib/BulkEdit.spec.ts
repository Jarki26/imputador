import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
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

  it('should calculate affected tasks count', async () => {
    const mockTasks = [
      { project: 'Old' },
      { project: 'Old' },
      { project: 'Other' }
    ];
    const taskStore = {
      getTasksForRange: vi.fn().mockResolvedValue(mockTasks)
    };
    const projectStore = {
      getRecentProjects: vi.fn().mockResolvedValue([])
    };

    render(BulkEdit, { props: { taskStore: taskStore as any, projectStore: projectStore as any } });

    const sourceInput = screen.getByLabelText(/Proyecto Origen/i) as HTMLInputElement;
    const targetInput = screen.getByLabelText(/Nuevo Nombre/i) as HTMLInputElement;
    
    // Autocomplete uses input internally
    await fireEvent.input(sourceInput, { target: { value: 'Old' } });
    await fireEvent.input(targetInput, { target: { value: 'New' } });

    const calcBtn = screen.getByText(/Calcular Cambios/i);
    await fireEvent.click(calcBtn);

    expect(await screen.findByText(/Tareas que serán afectadas: 2/i)).toBeDefined();
    expect(taskStore.getTasksForRange).toHaveBeenCalled();
  });
});
