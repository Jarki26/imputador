import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
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

  it('should increase cell height when zooming in', async () => {
    const { container } = render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });

    const zoomInBtn = screen.getByTitle(/Zoom In/i);
    await fireEvent.click(zoomInBtn); // 1.1x

    const hourCells = container.querySelectorAll('.hour-cell');
    // 60 * 1.1 = 66
    // Note: We need to make sure the style is actually applied to the element
    expect(hourCells[0].getAttribute('style')).toContain('height: 66px');
  });

  it('should decrease cell height when zooming out', async () => {
    const { container } = render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });

    const zoomOutBtn = screen.getByTitle(/Zoom Out/i);
    await fireEvent.click(zoomOutBtn); // 0.9x

    const hourCells = container.querySelectorAll('.hour-cell');
    // 60 * 0.9 = 54
    expect(hourCells[0].getAttribute('style')).toContain('height: 54px');
  });

  it('should restore default height when resetting zoom', async () => {
    const { container } = render(WeeklyView, { props: { startDate: new Date('2026-04-06') } });

    const zoomInBtn = screen.getByTitle(/Zoom In/i);
    const resetBtn = screen.getByTitle(/Reset Zoom/i);

    await fireEvent.click(zoomInBtn);
    await fireEvent.click(resetBtn);

    const hourCells = container.querySelectorAll('.hour-cell');
    expect(hourCells[0].getAttribute('style')).toContain('height: 60px');
  });
});
