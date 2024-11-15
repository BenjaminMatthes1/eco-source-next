// app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Conversation, { IConversation } from '@/models/Conversation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { participantIds } = await request.json(); // Array of user IDs to participate in the conversation

  try {
    // Validate participant IDs as an array of strings
    if (!Array.isArray(participantIds) || participantIds.some(id => typeof id !== 'string')) {
      return NextResponse.json({ message: 'Invalid participant IDs' }, { status: 400 });
    }

    // Convert the session user ID and each participant ID to ObjectId
    const participants = [
      new mongoose.Types.ObjectId(session.user.id),
      ...participantIds.map(id => new mongoose.Types.ObjectId(id)),
    ];

    // Create a new conversation, treating it as an instance of IConversation
    const conversation = new Conversation({
      participants,
    }) as IConversation;

    await conversation.save();

    return NextResponse.json({ message: 'Conversation created', conversation }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ message: 'Error creating conversation' }, { status: 500 });
  }
}
