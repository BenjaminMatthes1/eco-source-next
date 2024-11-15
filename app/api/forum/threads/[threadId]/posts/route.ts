// app/api/forum/threads/[threadId]/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Thread from '@/models/Thread';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { logActivity } from '@/utils/activityLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  await connectToDatabase();
  const { threadId } = params;

  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 });
  }

  const threadObjectId = new mongoose.Types.ObjectId(threadId);
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const page = pageParam && Number(pageParam) > 0 ? Number(pageParam) : 1;
  const limit = limitParam && Number(limitParam) > 0 ? Number(limitParam) : 20;

  try {
    // Fetch posts for the given thread ID with pagination
    const posts = await Post.find({ threadId: threadObjectId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return NextResponse.json({ data: { posts } }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { threadId } = params;

  if (!mongoose.Types.ObjectId.isValid(threadId)) {
    return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 });
  }

  const threadObjectId = new mongoose.Types.ObjectId(threadId);
  const { content } = await request.json();

  try {
    // Ensure content is provided
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if thread exists
    const thread = await Thread.findById(threadObjectId);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Create a new post for the thread
    const post = new Post({
      threadId: threadObjectId,
      author: new mongoose.Types.ObjectId(session.user.id),
      content,
    });

    await post.save();

    // Log the creation of a new post
    await logActivity(new mongoose.Types.ObjectId(session.user.id), 'CREATE_POST', {
      threadId,
      postId: post._id.toString(),
    });

    return NextResponse.json({ data: { message: 'Post created', post } }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
}
