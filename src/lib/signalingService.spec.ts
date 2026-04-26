import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signalingService } from './signalingService';
import { Peer } from 'peerjs';

vi.mock('peerjs', () => {
  const mockPeer = {
    on: vi.fn(),
    disconnect: vi.fn(),
    destroy: vi.fn(),
    reconnect: vi.fn(),
    id: null,
  };
  return {
    Peer: vi.fn().mockImplementation(function (this: any) {
      return mockPeer;
    }),
  };
});

describe('signalingService', () => {
  let mockPeer: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { Peer } = await import('peerjs');
    mockPeer = (Peer as any)();
    mockPeer.id = null;
    mockPeer.on.mockReset();
    mockPeer.destroy.mockReset();
  });

  it('should initialize PeerJS and return an ID', async () => {
    const mockId = 'test-peer-id';

    // Simulate 'open' event
    mockPeer.on.mockImplementation((event: string, callback: any) => {
      if (event === 'open') {
        mockPeer.id = mockId;
        callback(mockId);
      }
    });

    const id = await signalingService.initialize();

    expect(Peer).toHaveBeenCalled();
    expect(id).toBe(mockId);
  });

  it('should handle initialization error', async () => {
    const mockError = new Error('PeerJS connection failed');

    // Simulate 'error' event
    mockPeer.on.mockImplementation((event: string, callback: any) => {
      if (event === 'error') {
        callback(mockError);
      }
    });

    await expect(signalingService.initialize()).rejects.toThrow(
      'PeerJS connection failed',
    );
  });

  it('should destroy Peer instance', async () => {
    // Initialize first
    mockPeer.on.mockImplementation((event: string, callback: any) => {
      if (event === 'open') callback('test-id');
    });
    await signalingService.initialize();

    signalingService.destroy();
    expect(mockPeer.destroy).toHaveBeenCalled();
  });

  it('should do nothing if destroy is called before initialization', () => {
    signalingService.peer = null;
    signalingService.destroy();
    // Should not throw and should not call destroy on mockPeer
    expect(mockPeer.destroy).not.toHaveBeenCalled();
  });
});
