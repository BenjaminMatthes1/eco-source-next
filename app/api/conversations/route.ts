// app/api/messages/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Message from '@/models/Message';
import User from '@/models/User';
import connectToDatabase from '@/lib/mongooseClientPromise';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = session.user.id;

  try {
    // Find conversations involving the current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Extract unique conversation partners
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const otherUserId = message.senderId.toString() === currentUserId ? message.recipientId.toString() : message.senderId.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUserId,
          lastMessageContent: message.content,
          lastMessageDate: message.createdAt,
        });
      }
    });

    const conversations = await Promise.all(
      Array.from(conversationsMap.values()).map(async (conversation) => {
        const otherUser = await User.findById(conversation.otherUserId).select('name');
        return {
          ...conversation,
          otherUserName: otherUser?.name || 'Unknown',
        };
      })
    );

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ message: 'Error fetching conversations' }, { status: 500 });
  }
}
