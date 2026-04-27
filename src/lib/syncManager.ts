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
      console.log('Generating sync payload...');
      const payload = await syncService.generatePayload();
      console.log('Sending payload with', payload.tasks.length, 'tasks');
      p2pConnection.send({
        type: 'SYNC_PAYLOAD',
        payload,
      });
      this.pendingSync = false;
    } else {
      console.log('Offline: queuing sync');
      this.pendingSync = true;
    }
  },

  async processQueue() {
    if (this.pendingSync && p2pConnection.isConnected()) {
      console.log('Processing queued sync...');
      await this.sync();
    }
  },

  hasPendingSync() {
    return this.pendingSync;
  },

  setupListeners() {
    if (this.listenersSetup) return;

    p2pConnection.onOpen(() => {
      console.log('P2P Connection opened, triggering initial sync');
      this.sync();
    });

    p2pConnection.onData(async (data) => {
      console.log('Received data from peer:', data.type);
      if (data.type === 'SYNC_PAYLOAD') {
        console.log('Merging remote payload...');
        await syncEngine.mergePayload(data.payload);
        console.log('Merge complete, notifying listeners');
        this.mergeHandlers.forEach((handler) => handler());
      }
    });
    this.listenersSetup = true;
  },
};
