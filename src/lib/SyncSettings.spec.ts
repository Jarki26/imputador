import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import SyncSettings from './SyncSettings.svelte';
import { signalingService } from './signalingService';
import { p2pConnection } from './p2pConnection.svelte';
import { syncManager } from './syncManager';
import { i18n } from './i18n.svelte';

vi.mock('./signalingService', () => ({
  signalingService: {
    initialize: vi.fn(),
    peer: null,
  },
}));

let connected = false;
vi.mock('./p2pConnection.svelte', () => ({
  p2pConnection: {
    isConnected: vi.fn(() => connected),
    connect: vi.fn(async () => {
      connected = true;
    }),
    listen: vi.fn(),
    disconnect: vi.fn(() => {
      connected = false;
    }),
  },
}));

vi.mock('./syncManager', () => ({
  syncManager: {
    setupListeners: vi.fn(),
    sync: vi.fn(),
  },
}));

describe('SyncSettings.svelte', () => {
  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    await i18n.setLocale('es');
    (signalingService as any).peer = null;
    connected = false;
  });

  it('should initialize signaling and show local ID', async () => {
    (signalingService.initialize as any).mockResolvedValue('test-local-id');

    render(SyncSettings);

    expect(await screen.findByDisplayValue('test-local-id')).toBeDefined();
    expect(p2pConnection.listen).toHaveBeenCalled();
    expect(syncManager.setupListeners).toHaveBeenCalled();
  });

  it('should connect to remote ID', async () => {
    (signalingService.initialize as any).mockResolvedValue('test-local-id');

    render(SyncSettings);

    const remoteInput = await screen.findByPlaceholderText('remote-peer-id');
    await fireEvent.input(remoteInput, { target: { value: 'remote-id' } });

    const connectBtn = screen.getByText(/Conectar dispositivos/i);
    await fireEvent.click(connectBtn);

    expect(p2pConnection.connect).toHaveBeenCalledWith('remote-id');
    // Wait for UI to update
    expect(await screen.findByText(/Conectado/i)).toBeDefined();
    expect(syncManager.sync).toHaveBeenCalled();
  });

  it('should disconnect from remote peer', async () => {
    (signalingService.initialize as any).mockResolvedValue('test-local-id');
    connected = true;

    render(SyncSettings);

    const disconnectBtn = await screen.findByText(/Desconectar/i);
    await fireEvent.click(disconnectBtn);

    expect(p2pConnection.disconnect).toHaveBeenCalled();
  });
});
