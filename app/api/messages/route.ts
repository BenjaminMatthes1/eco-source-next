// app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Message from '@/models/Message';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipientId, content } = await request.json();

    // Validate recipientId and content
    if (!recipientId || !content) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    // Create a new message
    const message = new Message({
      senderId: session.user.id,
      recipientId,
      content,
    });

    await message.save();

    return NextResponse.json({ message: 'Message sent', data: message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
  }
}
