import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import WeeklyHeader from './WeeklyHeader.svelte';
import { i18n } from './i18n.svelte';

describe('WeeklyHeader.svelte', () => {
  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should render navigation buttons', () => {
    render(WeeklyHeader, {
      props: {
        startDate: new Date('2026-04-06'),
        totalBillableHours: 5,
        effectiveGoal: 40,
        remainingTime: 35,
        progressPercentage: 12.5,
      },
    });

    expect(screen.getByTitle('Semana Anterior')).toBeDefined();
    expect(screen.getByTitle('Semana Siguiente')).toBeDefined();
  });

  it('should trigger onNavigate when previous week is clicked', async () => {
    const onNavigate = vi.fn();
    const startDate = new Date('2026-04-06');
    render(WeeklyHeader, {
      props: {
        startDate,
        onNavigate,
        totalBillableHours: 5,
        effectiveGoal: 40,
        remainingTime: 35,
        progressPercentage: 12.5,
      },
    });

    const prevBtn = screen.getByTitle('Semana Anterior');
    await fireEvent.click(prevBtn);

    expect(onNavigate).toHaveBeenCalled();
    const calledDate = onNavigate.mock.calls[0][0];
    // Should be 7 days before 2026-04-06 -> 2026-03-30
    expect(calledDate.getDate()).toBe(30);
    expect(calledDate.getMonth()).toBe(2); // March
  });

  it('should trigger onNavigate when next week is clicked', async () => {
    const onNavigate = vi.fn();
    const startDate = new Date('2026-04-06');
    render(WeeklyHeader, {
      props: {
        startDate,
        onNavigate,
        totalBillableHours: 5,
        effectiveGoal: 40,
        remainingTime: 35,
        progressPercentage: 12.5,
      },
    });

    const nextBtn = screen.getByTitle('Semana Siguiente');
    await fireEvent.click(nextBtn);

    expect(onNavigate).toHaveBeenCalled();
    const calledDate = onNavigate.mock.calls[0][0];
    // Should be 7 days after 2026-04-06 -> 2026-04-13
    expect(calledDate.getDate()).toBe(13);
    expect(calledDate.getMonth()).toBe(3); // April
  });

  it('should display summary information correctly', () => {
    render(WeeklyHeader, {
      props: {
        startDate: new Date('2026-04-06'),
        totalBillableHours: 10.5,
        effectiveGoal: 39,
        remainingTime: 28.5,
        progressPercentage: 26.92,
      },
    });

    // Registrado: 10.50h / Objetivo: 39.00h | Restante: 28.50h
    expect(screen.getByText(/Registrado: 10\.50h \/ Objetivo: 39\.00h/i)).toBeDefined();
    expect(screen.getByText(/Restante: 28\.50h/i)).toBeDefined();
  });

  it('should update progress bar', () => {
    render(WeeklyHeader, {
      props: {
        startDate: new Date('2026-04-06'),
        totalBillableHours: 10,
        effectiveGoal: 40,
        remainingTime: 30,
        progressPercentage: 25.0,
      },
    });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('25.00');
    const bar = progressBar.querySelector('.progress-bar') as HTMLElement;
    expect(bar.style.width).toBe('25%');
  });
});
