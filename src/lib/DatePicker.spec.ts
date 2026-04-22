import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import DatePicker from './DatePicker.svelte';
import { i18n } from './i18n.svelte';

describe('DatePicker', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
    // Mock translations for testing
    i18n.setTranslations('es', {
      calendar: {
        today: 'Hoy',
        select_date: 'Seleccionar fecha',
        prev_month: 'Mes anterior',
        next_month: 'Mes siguiente',
        prev_year: 'Año anterior',
        next_year: 'Año siguiente',
        january: 'Enero',
        february: 'Febrero',
        march: 'Marzo',
        april: 'Abril',
        may: 'Mayo',
        june: 'Junio',
        july: 'Julio',
        august: 'Agosto',
        september: 'Septiembre',
        october: 'Octubre',
        november: 'Noviembre',
        december: 'Diciembre',
      },
    });
  });

  it('should render the calendar grid for a specific month', async () => {
    const testDate = new Date(2026, 3, 22); // April 22, 2026
    const { getByText, getAllByText } = render(DatePicker, {
      props: { selectedDate: testDate },
    });

    // Should show April 2026
    expect(getByText(/Abril/)).toBeDefined();
    expect(getByText(/2026/)).toBeDefined();

    // Check if some days of April are present
    // Use getAllByText and filter for current month if needed, 
    // but here we just want to see they exist.
    expect(getAllByText('1').length).toBeGreaterThan(0);
    expect(getByText('22')).toBeDefined();
    expect(getAllByText('30').length).toBeGreaterThan(0);
  });

  it('should highlight the selected date', () => {
    const testDate = new Date(2026, 3, 22);
    const { getByText } = render(DatePicker, {
      props: { selectedDate: testDate },
    });

    const selectedDay = getByText('22');
    expect(selectedDay.classList.contains('selected')).toBe(true);
  });

  it('should navigate to the previous and next month', async () => {
    const testDate = new Date(2026, 3, 22); // April
    const { getByLabelText, getByText } = render(DatePicker, {
      props: { selectedDate: testDate },
    });

    const prevBtn = getByLabelText('Mes anterior');
    const nextBtn = getByLabelText('Mes siguiente');

    await fireEvent.click(nextBtn);
    expect(getByText(/Mayo/)).toBeDefined();

    await fireEvent.click(prevBtn);
    await fireEvent.click(prevBtn);
    expect(getByText(/Marzo/)).toBeDefined();
  });

  it('should navigate to the previous and next year', async () => {
    const testDate = new Date(2026, 3, 22); // April 2026
    const { getByLabelText, getByText } = render(DatePicker, {
      props: { selectedDate: testDate },
    });

    // Mock translations for this test specifically if needed, 
    // but they should be in the beforeEach mock already if I update it.
    // Let's update the beforeEach mock first.
    
    const prevYearBtn = getByLabelText('Año anterior');
    const nextYearBtn = getByLabelText('Año siguiente');

    await fireEvent.click(nextYearBtn);
    expect(getByText(/2027/)).toBeDefined();

    await fireEvent.click(prevYearBtn);
    await fireEvent.click(prevYearBtn);
    expect(getByText(/2025/)).toBeDefined();
  });

  it('should navigate to today when "Today" button is clicked', async () => {
    const testDate = new Date(2020, 0, 1); // Not today
    const onSelect = vi.fn();
    const { getByText } = render(DatePicker, {
      props: { selectedDate: testDate, onSelect },
    });

    const todayBtn = getByText('Hoy');
    await fireEvent.click(todayBtn);

    expect(onSelect).toHaveBeenCalled();
    const calledDate = onSelect.mock.calls[0][0];
    const today = new Date();
    expect(calledDate.getFullYear()).toBe(today.getFullYear());
    expect(calledDate.getMonth()).toBe(today.getMonth());
    expect(calledDate.getDate()).toBe(today.getDate());
  });

  it('should emit a selection event when a day is clicked', async () => {
    const testDate = new Date(2026, 3, 22);
    const onSelect = vi.fn();
    const { getByText } = render(DatePicker, {
      props: { selectedDate: testDate, onSelect },
    });

    // To be safe, find the '15' that is NOT 'not-current'
    const days = document.querySelectorAll('.day-cell:not(.not-current)');
    const day15 = Array.from(days).find(d => d.textContent?.trim() === '15');
    
    if (!day15) throw new Error('Day 15 not found');
    await fireEvent.click(day15);

    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 3, 15));
  });
});
