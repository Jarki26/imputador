import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/svelte';
import WeeklyView from './WeeklyView.svelte';
import { i18n } from './i18n.svelte';
import { tick } from 'svelte';

describe('WeeklyView Sesame Sync', () => {
  const defaultProps = {
    startDate: new Date('2026-04-19'),
    tasks: [],
    onSyncSesame: vi.fn(),
  };

  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    await i18n.setLocale('en');
  });

  it('should render sync button when onSyncSesame is provided', async () => {
    render(WeeklyView, { props: defaultProps });
    expect(await screen.findByText(/Sync Sesame/i)).toBeDefined();
  });

  it('should call onSyncSesame when button is clicked', async () => {
    const onSyncSesame = vi.fn();
    render(WeeklyView, { props: { ...defaultProps, onSyncSesame } });

    const syncBtn = screen.getByText(/Sync Sesame/i);
    await fireEvent.click(syncBtn);

    expect(onSyncSesame).toHaveBeenCalled();
  });

  it('should show loading state during sync', async () => {
    let resolveSync: any;
    const onSyncSesame = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSync = resolve;
        }),
    );

    render(WeeklyView, { props: { ...defaultProps, onSyncSesame } });

    const syncBtn = screen.getByText(/Sync Sesame/i).closest('button')!;
    await fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(syncBtn.className).toContain('loading');
    });

    resolveSync!();
    await waitFor(() => {
      expect(syncBtn.className).not.toContain('loading');
    });
  });
});
