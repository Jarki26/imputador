import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('+page.svelte', () => {
  it('should render the Weekly View by default', () => {
    cleanup();
    render(Page);
    // Weekly View should have the 7 days grid
    expect(screen.getByText(/Monday/i)).toBeDefined();
    expect(screen.getByText(/Sunday/i)).toBeDefined();
  });

  it('should toggle between Weekly and Daily views', async () => {
    cleanup();
    render(Page);

    const dailyToggle = screen.getByRole('button', { name: /Daily View/i });
    await fireEvent.click(dailyToggle);

    // Daily Log title should appear (from TaskList section)
    expect(screen.getByText(/Daily Log/i)).toBeDefined();

    const weeklyToggle = screen.getByRole('button', { name: /Weekly View/i });
    await fireEvent.click(weeklyToggle);

    expect(screen.getByText(/Monday/i)).toBeDefined();
  });
});
