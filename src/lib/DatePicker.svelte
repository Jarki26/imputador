<script lang="ts">
  import { i18n } from './i18n.svelte';

  interface Props {
    selectedDate?: Date;
    onSelect?: (date: Date) => void;
  }

  let { selectedDate = new Date(), onSelect = () => {} }: Props = $props();

  // Internal state for the currently viewed month/year in the picker
  let viewDate = $state(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  $effect(() => {
    viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });

  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    let day = new Date(year, month, 1).getDay();
    // Adjust to 0 = Monday, ..., 6 = Sunday
    return (day + 6) % 7;
  }

  let calendarGrid = $derived.by(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

    const grid = [];

    // Fill previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false,
      });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
      });
    }

    // Fill next month days to complete the 6x7 grid (42 cells)
    const remaining = 42 - grid.length;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    for (let i = 1; i <= remaining; i++) {
      grid.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false,
      });
    }

    return grid;
  });

  function changeMonth(delta: number) {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
  }

  function changeYear(delta: number) {
    viewDate = new Date(viewDate.getFullYear() + delta, viewDate.getMonth(), 1);
  }

  function selectDay(day: number, month: number, year: number) {
    const newDate = new Date(year, month, day);
    onSelect(newDate);
  }

  function isSelected(day: number, month: number, year: number) {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  }

  function isToday(day: number, month: number, year: number) {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  }

  function goToToday() {
    const today = new Date();
    onSelect(today);
  }
</script>

<div class="date-picker">
  <div class="calendar-header">
    <div class="nav-group">
      <button
        class="nav-btn"
        onclick={() => changeYear(-1)}
        aria-label={i18n.t('calendar.prev_year')}>&lt;&lt;</button
      >
      <button
        class="nav-btn"
        onclick={() => changeMonth(-1)}
        aria-label={i18n.t('calendar.prev_month')}>&lt;</button
      >
    </div>
    <div class="current-month">
      {i18n.t(`calendar.${monthNames[viewDate.getMonth()]}`)}
      {viewDate.getFullYear()}
    </div>
    <div class="nav-group">
      <button
        class="nav-btn"
        onclick={() => changeMonth(1)}
        aria-label={i18n.t('calendar.next_month')}>&gt;</button
      >
      <button
        class="nav-btn"
        onclick={() => changeYear(1)}
        aria-label={i18n.t('calendar.next_year')}>&gt;&gt;</button
      >
    </div>
  </div>

  <div class="calendar-grid">
    {#each daysOfWeek as day}
      <div class="day-of-week">{day}</div>
    {/each}

    {#each calendarGrid as { day, month, year, isCurrentMonth }}
      <button
        class="day-cell"
        class:not-current={!isCurrentMonth}
        class:selected={isSelected(day, month, year)}
        class:today={isToday(day, month, year)}
        onclick={() => selectDay(day, month, year)}
      >
        {day}
      </button>
    {/each}
  </div>

  <div class="calendar-footer">
    <button class="today-btn" onclick={goToToday}>
      {i18n.t('calendar.today')}
    </button>
  </div>
</div>

<style>
  .date-picker {
    display: flex;
    flex-direction: column;
    width: 280px;
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    user-select: none;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
  }

  .current-month {
    font-weight: 500;
    font-size: 1rem;
  }

  .nav-group {
    display: flex;
    gap: 2px;
  }

  .nav-btn {
    background: none;
    border: none;
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem 0.5rem;
    border-radius: 50%;
  }

  .nav-btn:hover {
    background: var(--md-sys-color-surface-variant);
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0.5rem;
  }

  .day-of-week {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .day-cell {
    background: none;
    border: none;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    font-size: 0.875rem;
    color: var(--md-sys-color-on-surface);
    margin: 2px auto;
  }

  .day-cell:hover:not(.selected) {
    background: var(--md-sys-color-surface-variant);
  }

  .day-cell.not-current {
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.5;
  }

  .day-cell.selected {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }

  .day-cell.today {
    border: 1px solid var(--md-sys-color-primary);
    color: var(--md-sys-color-primary);
  }

  .day-cell.today.selected {
    color: var(--md-sys-color-on-primary);
  }

  .calendar-footer {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem;
    border-top: 1px solid var(--md-sys-color-outline-variant);
  }

  .today-btn {
    background: none;
    border: none;
    color: var(--md-sys-color-primary);
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .today-btn:hover {
    background: var(--md-sys-color-surface-variant);
  }
</style>
