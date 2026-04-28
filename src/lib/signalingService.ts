import Peer from 'peerjs';

export const signalingService = {
  peer: null as Peer | null,

  async initialize(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        debug: 3,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
          iceCandidatePoolSize: 10,
        },
      });

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
