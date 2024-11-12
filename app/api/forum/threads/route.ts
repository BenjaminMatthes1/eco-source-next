// app/api/forum/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Thread from '@/models/Thread';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { logActivity } from '@/utils/activityLogger';

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;
  const tag = searchParams.get('tag');

  try {
    const query = tag ? { tags: tag } : {};
    const threads = await Thread.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return NextResponse.json({ threads }, { status: 200 });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json({ message: 'Error fetching threads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, tags } = await request.json();

  try {
    const thread = new Thread({
      title,
      content,
      tags,
      author: session.user.id,
    });

    await thread.save();

    // Log activity
    await logActivity(session.user.id, 'CREATE_THREAD', { threadId: thread._id });

    return NextResponse.json({ message: 'Thread created', thread }, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json({ message: 'Error creating thread' }, { status: 500 });
  }
}
