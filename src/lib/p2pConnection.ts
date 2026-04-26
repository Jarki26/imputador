import { signalingService } from './signalingService';
import type { DataConnection } from 'peerjs';

type DataHandler = (data: any) => void;

export const p2pConnection = {
  connection: null as DataConnection | null,
  handlers: [] as DataHandler[],

  async connect(peerId: string): Promise<void> {
    if (!signalingService.peer) {
      throw new Error('PeerJS not initialized');
    }

    return new Promise((resolve, reject) => {
      const conn = signalingService.peer!.connect(peerId);
      this.setupConnection(conn, resolve, reject);
    });
  },

  setupConnection(
    conn: DataConnection,
    resolve?: () => void,
    reject?: (err: any) => void,
  ) {
    this.connection = conn;

    conn.on('open', () => {
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
  },

  onData(handler: DataHandler) {
    this.handlers.push(handler);
  },

  send(data: any) {
    if (this.connection) {
      this.connection.send(data);
    }
  },

  disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  },

  isConnected(): boolean {
    return this.connection !== null;
  },

  listen() {
    if (signalingService.peer) {
      signalingService.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });
    }
  },
};
