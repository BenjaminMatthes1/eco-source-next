import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase           from '@/lib/mongooseClientPromise';
import Comment                      from '@/models/Comment';
import Post                         from '@/models/Post';
import { getServerSession }         from 'next-auth/next';
import { authOptions }              from '@/lib/authOptions';
import { createNotification }       from '@/services/notificationService';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { content } = await request.json();
  if (!content?.trim())
    return NextResponse.json({ message: 'Content is required' }, { status: 400 });

  const { postId } = await params;

  /* ── create comment ────────────────────────────────────────── */
  const comment = await Comment.create({
    post: postId,
    author: session.user.id,
    content: content.trim(),
  });

  /* ── notify post author (skip self‑comment) ────────────────── */
  const post = await Post.findById(postId).select('author').lean();
  if (post && post.author.toString() !== session.user.id) {
    await createNotification(
      post.author.toString(),
      `${session.user.name || 'Someone'} commented on your post`,
      `/dashboard/forum/posts/${postId}#${comment._id}`
    );
  }

  return NextResponse.json({ message: 'Comment added', comment }, { status: 201 });
}

/* ------------------------------------------------------------------ */

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  await connectToDatabase();
  const { postId } = await params;

  try {
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name profilePictureUrl')   // avatar for UI
      .lean();

    return NextResponse.json({ comments }, { status: 200 });
  } catch (err) {
    console.error('Error fetching comments:', err);
    return NextResponse.json({ message: 'Error fetching comments' }, { status: 500 });
  }
}
