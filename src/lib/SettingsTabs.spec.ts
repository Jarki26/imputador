import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import Settings from './Settings.svelte';
import { i18n } from './i18n.svelte';
import type { ColumnMapping } from './exportConfigStore';

describe('Settings Tabs', () => {
  const defaultProps = {
    weeklyTarget: 41,
    exportTemplate: [] as ColumnMapping[],
    exportExclusions: [] as string[],
    excelDateFormat: 'DD/MM/YYYY',
    taskTypeColors: {} as Record<string, string>,
    onSave: vi.fn(),
    onSaveExportConfig: vi.fn(),
    onSaveTaskTypeColor: vi.fn(),
  };

  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    await i18n.setLocale('es');
  });

  it('should render basic tab buttons', () => {
    render(Settings, { props: defaultProps });

    expect(screen.getByRole('button', { name: /General/i })).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Opciones de Tarea/i }),
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Gestión de Datos/i }),
    ).toBeDefined();

    // Integrations should be hidden by default (no configStore)
    expect(screen.queryByRole('button', { name: /Integraciones/i })).toBeNull();
  });

  it('should render Integrations tab when configStore is provided', () => {
    const configStore = {
      getSesameEmail: vi.fn().mockResolvedValue(''),
      getSesameProxyUrl: vi.fn().mockResolvedValue(''),
    } as any;

    render(Settings, { props: { ...defaultProps, configStore } });
    expect(
      screen.getByRole('button', { name: /Integraciones/i }),
    ).toBeDefined();
  });

  it('should show General tab content by default', () => {
    render(Settings, { props: defaultProps });

    expect(screen.getByLabelText(/Objetivo de Horas Semanales/i)).toBeDefined();
    expect(screen.getByLabelText(/Idioma/i)).toBeDefined();
    expect(screen.getByText(/Colores por Tipo de Tarea/i)).toBeDefined();

    // Components from other tabs should NOT be visible
    expect(screen.queryByText(/Plantilla de Exportación/i)).toBeNull();
  });

  it('should switch content when clicking "Task Options" tab', async () => {
    render(Settings, { props: defaultProps });

    const taskOptionsTab = screen.getByRole('button', {
      name: /Opciones de Tarea/i,
    });
    await fireEvent.click(taskOptionsTab);

    // Task options content should be visible
    expect(screen.getByText(/Gestionar Empresas/i)).toBeDefined();
    expect(screen.getByText(/Mantenimiento \/ Edición Masiva/i)).toBeDefined();

    // General content should be hidden
    expect(screen.queryByLabelText(/Objetivo de Horas Semanales/i)).toBeNull();
    expect(screen.queryByText(/Colores por Tipo de Tarea/i)).toBeNull();
  });

  it('should switch content when clicking "Data Management" tab', async () => {
    render(Settings, { props: defaultProps });

    const dataTab = screen.getByRole('button', { name: /Gestión de Datos/i });
    await fireEvent.click(dataTab);

    expect(screen.getByText(/Plantilla de Exportación/i)).toBeDefined();
    expect(
      screen.getByText(/Copia de Seguridad y Restauración/i),
    ).toBeDefined();

    expect(screen.queryByLabelText(/Objetivo de Horas Semanales/i)).toBeNull();
  });

  it('should switch content when clicking "Integrations" tab', async () => {
    // We need to pass configStore for SesameSettings to be visible
    const configStore = {
      getSesameEmail: vi.fn().mockResolvedValue('test@example.com'),
      getSesameProxyUrl: vi.fn().mockResolvedValue(''),
    } as any;

    render(Settings, { props: { ...defaultProps, configStore } });

    const integrationsTab = screen.getByRole('button', {
      name: /Integraciones/i,
    });
    await fireEvent.click(integrationsTab);

    expect(screen.getByText(/Integración Sesame HR/i)).toBeDefined();
    expect(screen.queryByLabelText(/Objetivo de Horas Semanales/i)).toBeNull();
  });
});
