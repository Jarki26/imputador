import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncManager } from './syncManager';
import { p2pConnection } from './p2pConnection';
import { syncService } from './syncService';

vi.mock('./p2pConnection', () => ({
  p2pConnection: {
    isConnected: vi.fn(),
    send: vi.fn(),
    onData: vi.fn(),
  },
}));

vi.mock('./syncService', () => ({
  syncService: {
    generatePayload: vi.fn(),
  },
}));

describe('syncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send payload immediately if connected', async () => {
    (p2pConnection.isConnected as any).mockReturnValue(true);
    const mockPayload = { timestamp: 123 };
    (syncService.generatePayload as any).mockResolvedValue(mockPayload);

    await syncManager.sync();

    expect(syncService.generatePayload).toHaveBeenCalled();
    expect(p2pConnection.send).toHaveBeenCalledWith({
      type: 'SYNC_PAYLOAD',
      payload: mockPayload,
    });
  });

  it('should queue sync if disconnected', async () => {
    (p2pConnection.isConnected as any).mockReturnValue(false);
    const mockPayload = { timestamp: 123 };
    (syncService.generatePayload as any).mockResolvedValue(mockPayload);

    await syncManager.sync();

    expect(p2pConnection.send).not.toHaveBeenCalled();
    expect(syncManager.hasPendingSync()).toBe(true);
  });

  it('should process queue when connection is restored', async () => {
    (p2pConnection.isConnected as any).mockReturnValue(false);
    await syncManager.sync();

    (p2pConnection.isConnected as any).mockReturnValue(true);
    await syncManager.processQueue();

    expect(p2pConnection.send).toHaveBeenCalled();
    expect(syncManager.hasPendingSync()).toBe(false);
  });

  it('should handle incoming SYNC_PAYLOAD in listeners', async () => {
    let dataCallback: any;
    (p2pConnection.onData as any).mockImplementation((cb: any) => {
      dataCallback = cb;
    });

    const { syncEngine } = await import('./syncEngine');
    vi.mock('./syncEngine', () => ({
      syncEngine: {
        mergePayload: vi.fn(),
      },
    }));

    syncManager.setupListeners();
    const mockPayload = { timestamp: 456 };
    await dataCallback({ type: 'SYNC_PAYLOAD', payload: mockPayload });

    expect(syncEngine.mergePayload).toHaveBeenCalledWith(mockPayload);
  });
});
