// app/api/forum/posts/[postId]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Comment from '@/models/Comment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { postId } = params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const comment = new Comment({
      post: postId,
      author: session.user.id,
      content,
    });

    await comment.save();

    return NextResponse.json({ message: 'Comment added', comment }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ message: 'Error adding comment' }, { status: 500 });
  }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { postId: string } }
  ) {
    await connectToDatabase();
  
    const { postId } = params;
  
    try {
      const comments = await Comment.find({ post: postId })
        .sort({ createdAt: 1 })
        .populate('author', 'name');
  
      return NextResponse.json({ comments }, { status: 200 });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ message: 'Error fetching comments' }, { status: 500 });
    }
  }
  