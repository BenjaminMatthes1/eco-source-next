import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase           from '@/lib/mongooseClientPromise';
import Comment                      from '@/models/Comment';
import Post                         from '@/models/Post';
import { getServerSession }         from 'next-auth/next';
import { authOptions }              from '@/lib/authOptions';
import { createNotification }       from '@/services/notificationService';

export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim())
    return NextResponse.json({ message: 'Content required' }, { status: 400 });

  /* ── find parent comment and its post ───────────────────────── */
  const parent = await Comment.findById(params.commentId).lean();
  if (!parent)
    return NextResponse.json({ message: 'Parent not found' }, { status: 404 });

  const post = await Post.findById(parent.post).select('author').lean();
  if (!post)
    return NextResponse.json({ message: 'Post not found' }, { status: 404 });

  /* ── create reply ───────────────────────────────────────────── */
  const reply = await Comment.create({
    post:           parent.post,
    author:         session.user.id,
    content:        content.trim(),
    parentComment:  parent._id,
  });

  const linkToReply = `/dashboard/forum/posts/${post._id}#${reply._id}`;

  /* ── notify parent‑comment author ───────────────────────────── */
  if (parent.author.toString() !== session.user.id) {
    await createNotification(
      parent.author.toString(),
      `${session.user.name || 'Someone'} replied to your comment`,
      linkToReply
    );
  }

  /* ── notify post author (if different) ─────────────────────── */
  if (
    post.author.toString() !== session.user.id &&
    post.author.toString() !== parent.author.toString()
  ) {
    await createNotification(
      post.author.toString(),
      `${session.user.name || 'Someone'} commented on your post`,
      linkToReply
    );
  }

  return NextResponse.json({ reply }, { status: 201 });
}
