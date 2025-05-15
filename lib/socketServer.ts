import type { Server as HTTPServer } from 'http';
import { Server as IOServer, type Socket } from 'socket.io';

/** singleton reference */
let io: IOServer | null = null;

/** Call ONCE (from /pages/api/socket.ts) with the Node HTTP server */
export const initSocket = (server: HTTPServer) => {
  if (io) return io;                               // already booted

  io = new IOServer(server, {
    path: '/api/socket',                           // <‑ same path client uses
    cors: { origin: '*' },                         // tighten later
  });

  io.on('connection', (socket: Socket) => {
    /* Join a room named after the user so we can emit privately */
    const { userId } = socket.handshake.query as { userId?: string };
    if (userId) socket.join(userId);
  });

  return io;
};

/** Safe accessor for route files that only need to emit */
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
};
