// services/notificationService.ts
import Notification from '@/models/Notification';

export async function getUserNotifications(userId: string) {
  // Fetch the user's notifications from the database
  return await Notification.find({ userId }).sort({ timestamp: -1 }).limit(10);
}
