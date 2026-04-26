import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import SyncStatus from './SyncStatus.svelte';
import { p2pConnection } from './p2pConnection.svelte';
import { syncManager } from './syncManager';
import { i18n } from './i18n.svelte';

vi.mock('./p2pConnection.svelte', () => ({
  p2pConnection: {
    isConnected: vi.fn(),
  },
}));

vi.mock('./syncManager', () => ({
  syncManager: {
    hasPendingSync: vi.fn(),
  },
}));

describe('SyncStatus.svelte', () => {
  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    await i18n.setLocale('es');
  });

  it('should show disconnected status initially', () => {
    (p2pConnection.isConnected as any).mockReturnValue(false);
    (syncManager.hasPendingSync as any).mockReturnValue(false);

    render(SyncStatus);
    const container = screen.getByTitle(/Desconectado/i);
    expect(container).toBeDefined();
    expect(screen.queryByText('!')).toBeNull();
  });

  it('should show connected status', () => {
    (p2pConnection.isConnected as any).mockReturnValue(true);
    (syncManager.hasPendingSync as any).mockReturnValue(false);

    render(SyncStatus);
    const container = screen.getByTitle(/Conectado/i);
    expect(container).toBeDefined();
  });

  it('should show pending badge', () => {
    (p2pConnection.isConnected as any).mockReturnValue(false);
    (syncManager.hasPendingSync as any).mockReturnValue(true);

    render(SyncStatus);
    expect(screen.getByText('!')).toBeDefined();
  });
});
