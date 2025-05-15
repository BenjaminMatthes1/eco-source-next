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

export async function getUserNotifications(userId: string) {
  return Notification.find({ userId }).sort({ timestamp: -1 }).lean();
}
