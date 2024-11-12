// app/api/conversations/[conversationId]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = params;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  try {
    // Check if the user is part of the conversation
    const conversation = await Conversation.findById(conversationId).exec();

    if (
      !conversation ||
      !conversation.participants.includes(session.user.id)
    ) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = params;
  const { content } = await request.json();

  try {
    // Check if the user is part of the conversation
    const conversation = await Conversation.findById(conversationId).exec();

    if (
      !conversation ||
      !conversation.participants.includes(session.user.id)
    ) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const message = new Message({
      conversationId,
      sender: session.user.id,
      content,
    });

    await message.save();

    // Update lastMessage in Conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    return NextResponse.json({ message: 'Message sent', data: message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
  }
}
