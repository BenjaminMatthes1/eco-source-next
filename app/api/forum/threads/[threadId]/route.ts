// app/api/forum/threads/[threadId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Thread from '@/models/Thread';
import Post from '@/models/Post';

export async function GET(request: NextRequest, context: any) {
  const params = await context.params;
  const userId = params.userId;
  
  await connectToDatabase();
  const { threadId } = params;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  try {
    // Fetch the thread by ID
    const thread = await Thread.findById(threadId).exec();
    if (!thread) {
      return NextResponse.json({ message: 'Thread not found' }, { status: 404 });
    }

    // Fetch posts for the thread with pagination
    const posts = await Post.find({ threadId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return NextResponse.json({ thread, posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching thread and posts:', error);
    return NextResponse.json({ message: 'Error fetching thread and posts' }, { status: 500 });
  }
}
