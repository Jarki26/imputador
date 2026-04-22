import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyView.svelte - Navigation', () => {
  beforeEach(async () => {
    await i18n.setLocale('es');
  });

  it('should trigger onNavigate when previous/next week arrows are clicked', async () => {
    cleanup();
    const onNavigate = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    render(WeeklyView, { props: { startDate, onNavigate } });

    // Find previous week button
    const prevButton = screen.getByTitle('Semana Anterior');
    expect(prevButton).toBeDefined();

    // Find next week button
    const nextButton = screen.getByTitle('Semana Siguiente');
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

  it('should trigger onDayClick when a day header is clicked', async () => {
    cleanup();
    const onDayClick = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    render(WeeklyView, { props: { startDate, onDayClick } });

    // Find the Monday header
    const mondayHeader = screen.getByText('Lunes').closest('.day-header');
    expect(mondayHeader).toBeDefined();

    // Click the header
    await fireEvent.click(mondayHeader!);

    expect(onDayClick).toHaveBeenCalled();
    const clickedDate = onDayClick.mock.calls[0][0];
    expect(clickedDate.getDate()).toBe(6);
    expect(clickedDate.getMonth()).toBe(3); // April
  });

  it('should open the calendar modal and navigate to the selected date', async () => {
    cleanup();
    const onNavigate = vi.fn();
    const startDate = new Date('2026-04-06'); // Monday
    render(WeeklyView, { props: { startDate, onNavigate } });

    // 1. Find the calendar icon button (by title/aria-label)
    const calendarBtn = screen.getByTitle('Seleccionar fecha');
    expect(calendarBtn).toBeDefined();

    // 2. Click the calendar icon
    await fireEvent.click(calendarBtn);

    // 3. Confirm modal is open (contains DatePicker elements)
    // We can look for the "Hoy" button from DatePicker
    expect(screen.getByText('Hoy')).toBeDefined();

    // 4. Click a different date in the calendar (e.g., April 15)
    const day15 = screen.getByText('15');
    await fireEvent.click(day15);

    // 5. Confirm onNavigate was called with the correct date
    expect(onNavigate).toHaveBeenCalled();
    const navigatedDate = onNavigate.mock.calls[0][0];
    expect(navigatedDate.getFullYear()).toBe(2026);
    expect(navigatedDate.getMonth()).toBe(3); // April
    expect(navigatedDate.getDate()).toBe(15);

    // 6. Confirm modal is closed (Hoy button should be gone)
    expect(screen.queryByText('Hoy')).toBeNull();
  });
});
