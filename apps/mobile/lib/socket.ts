import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/constants/api';

class SocketClient {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(API_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  get instance(): Socket | null {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
