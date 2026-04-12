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
});
