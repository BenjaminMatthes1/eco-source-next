// app/api/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Message from '@/models/Message';
import User from '@/models/User';
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
    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { recipientId: currentUserId }],
    }).sort({ createdAt: -1 });

    // Get unique user IDs of other participants
    const userIds = new Set<string>();
    messages.forEach((msg) => {
      if (msg.senderId.toString() !== currentUserId) {
        userIds.add(msg.senderId.toString());
      }
      if (msg.recipientId.toString() !== currentUserId) {
        userIds.add(msg.recipientId.toString());
      }
    });

    // Fetch user details
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select(
      'name companyName'
    );

    return NextResponse.json({ threads: users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json({ message: 'Error fetching threads' }, { status: 500 });
  }
}
