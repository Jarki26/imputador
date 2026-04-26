import { Peer } from 'peerjs';

export const signalingService = {
  peer: null as Peer | null,

  async initialize(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer();

      this.peer.on('open', (id) => {
        resolve(id);
      });

      this.peer.on('error', (err) => {
        reject(err);
      });
    });
  },

  destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  },
};
