// app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { participantIds } = await request.json(); // Array of user IDs to participate in the conversation

  try {
    const conversation = new Conversation({
      participants: [session.user.id, ...participantIds],
    });

    await conversation.save();

    return NextResponse.json({ message: 'Conversation created', conversation }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ message: 'Error creating conversation' }, { status: 500 });
  }
}
