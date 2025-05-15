import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (userId: string) => {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      query: { userId },
    });
  }
  return socket;
};
