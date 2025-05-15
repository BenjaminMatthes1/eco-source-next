import type { NextApiRequest, NextApiResponse } from 'next';
import { initSocket, SocketServer, SocketWithIO } from '@/lib/socketServer';

export const config = {
  api: { bodyParser: false }, // must disable body parser
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = req.socket as SocketWithIO;
  if (!socket.server.io) {
    initSocket(socket.server as SocketServer);
  }
  res.end();
}
