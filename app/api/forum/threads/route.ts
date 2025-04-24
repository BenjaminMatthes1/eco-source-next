// app/api/forum/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Thread from '@/models/Thread';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { logActivity } from '@/utils/activityLogger';

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const tag = searchParams.get('tag');

  const page = pageParam && Number(pageParam) > 0 ? Number(pageParam) : 1;
  const limit = limitParam && Number(limitParam) > 0 ? Number(limitParam) : 20;

  try {
    // Create query filter based on tag if provided
    const query: { tags?: string } = tag ? { tags: tag } : {};
    
    // Fetch threads with pagination
    const threads = await Thread.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return NextResponse.json({ data: { threads } }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching threads:', error);
    return NextResponse.json({ error: 'Error fetching threads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, tags } = await request.json();

  try {
    // Trim inputs
    const trimmedTitle = title?.trim();
    const trimmedContent = content?.trim();

    // Ensure title and content are provided
    if (!trimmedTitle || !trimmedContent) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Ensure tags is an array of strings
    let sanitizedTags: string[] = [];

    if (Array.isArray(tags)) {
      sanitizedTags = tags.filter((tag) => typeof tag === 'string').map((tag) => tag.trim());
    }

    // Convert author ID to ObjectId
    const authorObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Create a new thread with author and optional tags
    const thread = new Thread({
      title: trimmedTitle,
      content: trimmedContent,
      tags: sanitizedTags,
      author: authorObjectId,
    });

    await thread.save();

    // Log activity
    await logActivity(authorObjectId, 'CREATE_THREAD', { threadId: thread._id.toString() });

    return NextResponse.json({ data: { message: 'Thread created', thread } }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating thread:', error);
    return NextResponse.json({ error: 'Error creating thread' }, { status: 500 });
  }
}
