// app/api/users/[userId]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRecentMessages } from '@/services/messageService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise'; // Adjust the path as necessary

export async function GET(request: NextRequest, context: any) {
    const params = await context.params;
    const userId = params.userId;
  // **Establish database connection**
  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    return NextResponse.json(
      { error: 'Database connection error' },
      { status: 500 }
    );
  }

  const session = await getServerSession(authOptions);
 

  if (!session || session.user.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await getRecentMessages(userId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
