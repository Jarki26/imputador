import { signalingService } from './signalingService';
import type { DataConnection } from 'peerjs';

type DataHandler = (data: any) => void;

class P2PConnection {
  connection = $state<DataConnection | null>(null);
  handlers: DataHandler[] = [];
  openHandlers: (() => void)[] = [];
  listening = false;

  constructor() {}

  async connect(peerId: string): Promise<void> {
    if (!signalingService.peer) {
      throw new Error('PeerJS not initialized');
    }

    return new Promise((resolve, reject) => {
      const conn = signalingService.peer!.connect(peerId);
      this.setupConnection(conn, resolve, reject);
    });
  }

  setupConnection(
    conn: DataConnection,
    resolve?: () => void,
    reject?: (err: any) => void,
  ) {
    this.connection = conn;

    conn.on('open', () => {
      this.openHandlers.forEach((handler) => handler());
      if (resolve) resolve();
    });

    conn.on('data', (data) => {
      this.handlers.forEach((handler) => handler(data));
    });

    conn.on('error', (err) => {
      if (reject) reject(err);
    });

    conn.on('close', () => {
      this.connection = null;
    });
  }

  onData(handler: DataHandler) {
    this.handlers.push(handler);
  }

  onOpen(handler: () => void) {
    this.openHandlers.push(handler);
  }

  send(data: any) {
    if (this.connection) {
      this.connection.send(data);
    }
  }

  disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  isConnected(): boolean {
    return this.connection !== null;
  }

  listen() {
    if (this.listening) return;
    if (signalingService.peer) {
      signalingService.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });
      this.listening = true;
    }
  }
}

export const p2pConnection = new P2PConnection();
