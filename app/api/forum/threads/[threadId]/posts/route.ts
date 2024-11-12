// app/api/forum/threads/[threadId]/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { logActivity } from '@/utils/activityLogger';

export async function GET(request: NextRequest, { params }: { params: { threadId: string } }) {
  await connectToDatabase();
  const { threadId } = params;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  try {
    const posts = await Post.find({ threadId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { threadId: string } }) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { threadId } = params;
  const { content } = await request.json();

  try {
    const post = new Post({
      threadId,
      author: session.user.id,
      content,
    });

    await post.save();

    // Log activity
    await logActivity(session.user.id, 'CREATE_POST', { threadId, postId: post._id });

    return NextResponse.json({ message: 'Post created', post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ message: 'Error creating post' }, { status: 500 });
  }
}
