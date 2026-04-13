import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import Page from './+page.svelte';
import { i18n } from '$lib/i18n.svelte';

describe('+page.svelte', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should render the Weekly View by default', () => {
    render(Page);
    // Weekly View should have the 7 days grid
    expect(screen.getByText(/Lunes/i)).toBeDefined();
    expect(screen.getByText(/Domingo/i)).toBeDefined();
  });

  it('should toggle between Weekly and Daily views', async () => {
    render(Page);

    const dailyToggle = screen.getByRole('button', { name: /Vista Diaria/i });
    await fireEvent.click(dailyToggle);

    // Daily Log title should appear (from TaskList section)
    expect(screen.getByText(/Registro Diario/i)).toBeDefined();

    const weeklyToggle = screen.getByRole('button', { name: /Vista Semanal/i });
    await fireEvent.click(weeklyToggle);

    expect(screen.getByText(/Lunes/i)).toBeDefined();
  });

  it('should render the settings button', () => {
    render(Page);
    // Looking for button with title/aria-label "Ajustes"
    expect(screen.getByTitle(/Ajustes/i)).toBeDefined();
  });

  it('should render the help button', () => {
    render(Page);
    // Looking for button with title/aria-label "Ayuda"
    expect(screen.getByTitle(/Ayuda/i)).toBeDefined();
  });

  it('should open settings modal and show export configuration', async () => {
    render(Page);
    
    const settingsBtn = screen.getByTitle(/Ajustes/i);
    await fireEvent.click(settingsBtn);
    
    // Check if Settings modal content is visible
    expect(screen.getByText(/Objetivo de Horas Semanales/i)).toBeDefined();
    expect(screen.getByText(/Plantilla de Exportación/i)).toBeDefined();
    expect(screen.getByText(/Excluir Tipos de Tarea/i)).toBeDefined();
    
    // Check for the specific Save button
    expect(screen.getByRole('button', { name: /^Guardar$/i })).toBeDefined();
  });
});
