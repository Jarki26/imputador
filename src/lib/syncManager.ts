import { p2pConnection } from './p2pConnection';
import { syncService } from './syncService';
import { syncEngine } from './syncEngine';

export const syncManager = {
  pendingSync: false,

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
    p2pConnection.onData(async (data) => {
      if (data.type === 'SYNC_PAYLOAD') {
        await syncEngine.mergePayload(data.payload);
      }
    });
  },
};
