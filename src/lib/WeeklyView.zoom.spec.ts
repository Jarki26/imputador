import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView Zoom Functionality', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('en');
  });

  it('should render zoom controls', () => {
    render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });

    // These buttons don't exist yet, so this should fail
    expect(screen.getByTitle(/Zoom In/i)).toBeDefined();
    expect(screen.getByTitle(/Zoom Out/i)).toBeDefined();
    expect(screen.getByTitle(/Reset Zoom/i)).toBeDefined();
  });

  it('should have default cell height of 60px (1x zoom)', () => {
    render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });

    const hourCells = document.querySelectorAll('.hour-cell');
    expect(hourCells[0].clientHeight).toBe(60);
  });
});
