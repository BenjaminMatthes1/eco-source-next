// app/api/messages/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Message from '@/models/Message';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';


export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
  ) {
    await connectToDatabase();
  
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  
    const currentUserId = session.user.id;
    const otherUserId = params.userId;
  
    try {
      const messages = await Message.find({
        $or: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId },
        ],
      }).sort({ createdAt: 1 });
  
      return NextResponse.json({ messages }, { status: 200 });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
    }
  }

export async function POST(
    request: NextRequest,
    { params }: { params: { userId: string } }
  ) {
    await connectToDatabase();
  
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  
    const currentUserId = session.user.id;
    const otherUserId = params.userId;
    const { content } = await request.json();
  
    try {
      const newMessage = await Message.create({
        senderId: currentUserId,
        recipientId: otherUserId,
        content,
      });
  
      return NextResponse.json({ message: 'Message sent', newMessage }, { status: 201 });
    } catch (error) {
      console.error('Error sending message:', error);
      return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
    }
  }