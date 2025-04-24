// services/messageService.ts
import Message from '@/models/Message';

export async function getRecentMessages(userId: string) {
  // Fetch the user's recent messages from the database
  return await Message.find({ recipientId: userId }).sort({ timestamp: -1 }).limit(5);
}
