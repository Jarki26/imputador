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
    const { getByText, getAllByRole } = render(DatePicker, {
      props: { selectedDate: testDate },
    });

    // Should show April 2026
    expect(getByText(/Abril/)).toBeDefined();
    expect(getByText(/2026/)).toBeDefined();

    // Check if some days of April are present
    expect(getByText('1')).toBeDefined();
    expect(getByText('22')).toBeDefined();
    expect(getByText('30')).toBeDefined();
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

    const prevBtn = getByLabelText('calendar.prev_month');
    const nextBtn = getByLabelText('calendar.next_month');

    await fireEvent.click(nextBtn);
    expect(getByText(/Mayo/)).toBeDefined();

    await fireEvent.click(prevBtn);
    await fireEvent.click(prevBtn);
    expect(getByText(/Marzo/)).toBeDefined();
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

    const day15 = getByText('15');
    await fireEvent.click(day15);

    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 3, 15));
  });
});
