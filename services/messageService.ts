// services/messageService.ts
import Message from '@/models/Message';

export async function getRecentMessages(userId: string) {
    const messages = await Message.find({ recipientId: userId })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();
  
    return messages; // Will be an empty array if no messages are found
  }
