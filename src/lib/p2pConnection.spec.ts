import { describe, it, expect, vi, beforeEach } from 'vitest';
import { p2pConnection } from './p2pConnection.svelte';
import { signalingService } from './signalingService';

vi.mock('./signalingService', () => ({
  signalingService: {
    peer: {
      connect: vi.fn(),
      on: vi.fn(),
    },
  },
}));

describe('p2pConnection', () => {
  let mockDataConnection: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDataConnection = {
      on: vi.fn(),
      send: vi.fn(),
      close: vi.fn(),
      peer: 'remote-peer-id',
    };
    (signalingService.peer!.connect as any).mockReturnValue(mockDataConnection);
  });

  it('should connect to a peer and setup listeners', async () => {
    const peerId = 'remote-peer-id';

    // Simulate 'open' event on data connection
    mockDataConnection.on.mockImplementation((event: string, callback: any) => {
      if (event === 'open') callback();
    });

    await p2pConnection.connect(peerId);

    expect(signalingService.peer!.connect).toHaveBeenCalledWith(peerId);
    expect(mockDataConnection.on).toHaveBeenCalledWith(
      'data',
      expect.any(Function),
    );
    expect(mockDataConnection.on).toHaveBeenCalledWith(
      'open',
      expect.any(Function),
    );
    expect(p2pConnection.isConnected()).toBe(true);
  });

  it('should handle incoming data', async () => {
    const peerId = 'remote-peer-id';
    let dataCallback: any;

    mockDataConnection.on.mockImplementation((event: string, callback: any) => {
      if (event === 'open') callback();
      if (event === 'data') dataCallback = callback;
    });

    const receivedData: any[] = [];
    p2pConnection.onData((data) => receivedData.push(data));

    await p2pConnection.connect(peerId);
    dataCallback({ type: 'TEST', payload: 'hello' });

    expect(receivedData).toEqual([{ type: 'TEST', payload: 'hello' }]);
  });

  it('should send data to connected peer', async () => {
    const peerId = 'remote-peer-id';
    mockDataConnection.on.mockImplementation((event: string, callback: any) => {
      if (event === 'open') callback();
    });

    await p2pConnection.connect(peerId);
    p2pConnection.send({ type: 'PING' });

    expect(mockDataConnection.send).toHaveBeenCalledWith({ type: 'PING' });
  });

  it('should disconnect and cleanup', async () => {
    const peerId = 'remote-peer-id';
    mockDataConnection.on.mockImplementation((event: string, callback: any) => {
      if (event === 'open') callback();
    });

    await p2pConnection.connect(peerId);
    p2pConnection.disconnect();

    expect(mockDataConnection.close).toHaveBeenCalled();
    expect(p2pConnection.isConnected()).toBe(false);
  });

  it('should handle connection close event', async () => {
    const peerId = 'remote-peer-id';
    let closeCallback: any;

    mockDataConnection.on.mockImplementation((event: string, callback: any) => {
      if (event === 'open') callback();
      if (event === 'close') closeCallback = callback;
    });

    await p2pConnection.connect(peerId);
    expect(p2pConnection.isConnected()).toBe(true);

    closeCallback();
    expect(p2pConnection.isConnected()).toBe(false);
  });

  it('should throw error if signalingService is not initialized', async () => {
    const originalPeer = signalingService.peer;
    (signalingService as any).peer = null;

    await expect(p2pConnection.connect('any-id')).rejects.toThrow(
      'PeerJS not initialized',
    );

    (signalingService as any).peer = originalPeer;
  });

  it('should handle connection error', async () => {
    const peerId = 'remote-peer-id';
    const mockError = new Error('Connection failed');

    mockDataConnection.on.mockImplementation((event: string, callback: any) => {
      if (event === 'error') callback(mockError);
    });

    await expect(p2pConnection.connect(peerId)).rejects.toThrow(
      'Connection failed',
    );
  });

  it('should handle incoming connections when listening', () => {
    p2pConnection.listen();

    const onConnectionCallback = (
      signalingService.peer!.on as any
    ).mock.calls.find((call: any) => call[0] === 'connection')?.[1];

    expect(onConnectionCallback).toBeDefined();

    const mockIncomingConn = {
      on: vi.fn(),
      peer: 'incoming-peer-id',
    };

    onConnectionCallback(mockIncomingConn);

    expect(p2pConnection.isConnected()).toBe(true);
  });
});
