// services/notificationService.ts
import Notification from '@/models/Notification';
import { getIO } from '@/lib/socketServer';

export async function createNotification(
  userId: string,
  message: string,
  link: string
) {
  const notif = await Notification.create({ userId, message, link});
  try {
    const io = getIO();
    io.to(userId).emit('notification:new', notif);   // real‑time push
  } catch {
    /* socket not initialised yet – ignore */
  }
  return notif;
}

// helpers (used nowhere else but handy)
export function emitRead(userId: string, notifId: string) {
  getIO().to(userId).emit('notification:read', notifId);
}
export function emitRemoved(userId: string, notifId: string) {
  getIO().to(userId).emit('notification:removed', notifId);
}

export async function getUserNotifications(userId: string) {
  return Notification.find({ userId }).sort({ timestamp: -1 }).lean();
}
