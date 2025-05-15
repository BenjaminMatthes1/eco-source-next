import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase           from '@/lib/mongooseClientPromise';
import Post                         from '@/models/Post';
import { getServerSession }         from 'next-auth/next';
import { authOptions }              from '@/lib/authOptions';
import mongoose                     from 'mongoose';
import { createNotification }       from '@/services/notificationService';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;
  const userIdObj  = new mongoose.Types.ObjectId(session.user.id);

  /* ── find post ──────────────────────────────────────────────── */
  const post = await Post.findById(postId);
  if (!post)
    return NextResponse.json({ message: 'Post not found' }, { status: 404 });

  /* ── prevent duplicate up‑votes ─────────────────────────────── */
  if (post.upvotedBy.includes(userIdObj))
    return NextResponse.json(
      { message: 'You have already up‑voted this post' },
      { status: 400 }
    );

  post.upvotedBy.push(userIdObj);
  post.upvotes = post.upvotedBy.length;
  await post.save();

  /* ── notify post author (skip self‑vote) ───────────────────── */
  if (post.author.toString() !== session.user.id) {
    await createNotification(
      post.author.toString(),
      `${session.user.name || 'Someone'} up‑voted your post`,
      `/dashboard/forum/posts/${post._id}`
    );
  }

  return NextResponse.json(
    { message: 'Post up‑voted', upvotes: post.upvotes },
    { status: 200 }
  );
}
