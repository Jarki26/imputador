import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';

describe('WeeklyView.svelte - Navigation', () => {
  it('should trigger onNavigate when previous/next week arrows are clicked', async () => {
    cleanup();
    const onNavigate = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    render(WeeklyView, { props: { startDate, onNavigate } });

    // Find previous week button
    const prevButton = screen.getByTitle(/Previous Week/i);
    expect(prevButton).toBeDefined();

    // Find next week button
    const nextButton = screen.getByTitle(/Next Week/i);
    expect(nextButton).toBeDefined();

    // Click previous week
    await fireEvent.click(prevButton);
    expect(onNavigate).toHaveBeenCalled();
    const prevDate = onNavigate.mock.calls[0][0];
    // Should be 7 days before
    expect(prevDate.getDate()).toBe(30);
    expect(prevDate.getMonth()).toBe(2); // March

    // Click next week
    await fireEvent.click(nextButton);
    expect(onNavigate).toHaveBeenCalledTimes(2);
    const nextDate = onNavigate.mock.calls[1][0];
    // Should be 7 days after the original startDate
    expect(nextDate.getDate()).toBe(13);
    expect(nextDate.getMonth()).toBe(3); // April
  });
});
