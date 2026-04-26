import { p2pConnection } from './p2pConnection.svelte';
import { syncService } from './syncService';
import { syncEngine } from './syncEngine';

export const syncManager = {
  pendingSync: false,
  listenersSetup: false,
  mergeHandlers: [] as (() => void)[],

  onDataMerged(handler: () => void) {
    this.mergeHandlers.push(handler);
  },

  async sync() {
    if (p2pConnection.isConnected()) {
      const payload = await syncService.generatePayload();
      p2pConnection.send({
        type: 'SYNC_PAYLOAD',
        payload,
      });
      this.pendingSync = false;
    } else {
      this.pendingSync = true;
    }
  },

  async processQueue() {
    if (this.pendingSync && p2pConnection.isConnected()) {
      await this.sync();
    }
  },

  hasPendingSync() {
    return this.pendingSync;
  },

  setupListeners() {
    if (this.listenersSetup) return;

    p2pConnection.onOpen(() => {
      this.sync();
    });

    p2pConnection.onData(async (data) => {
      if (data.type === 'SYNC_PAYLOAD') {
        await syncEngine.mergePayload(data.payload);
        this.mergeHandlers.forEach((handler) => handler());
      }
    });
    this.listenersSetup = true;
  },
};
