// app/api/forum/posts/[postId]/upvote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';

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
    const userId = new mongoose.Types.ObjectId(session.user.id); // Convert userId to ObjectId


    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Optionally, you can prevent users from upvoting their own posts
    // if (post.author.toString() === session.user.id) {
    //   return NextResponse.json({ message: 'Cannot upvote your own post' }, { status: 400 });
    // }

    
        // Check if the user has already upvoted
    if (post.upvotedBy.includes(userId)) {
      return NextResponse.json(
        { message: 'You have already upvoted this post' },
        { status: 400 }
      );
    }

    // Add user to upvotedBy and increment upvotes
    post.upvotedBy.push(userId);
    post.upvotes = post.upvotedBy.length;
    await post.save();

    return NextResponse.json({ message: 'Post upvoted', upvotes: post.upvotes }, { status: 200 });
  } catch (error) {
    console.error('Error upvoting post:', error);
    return NextResponse.json({ message: 'Error upvoting post' }, { status: 500 });
  }
}
