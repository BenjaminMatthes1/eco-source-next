import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase           from '@/lib/mongooseClientPromise';
import Message                      from '@/models/Message';
import { getServerSession }         from 'next-auth/next';
import { authOptions }              from '@/lib/authOptions';
import { getIO }                    from '@/lib/socketServer';
import { createNotification }       from '@/services/notificationService';

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const currentUserId = session.user.id;
  const otherUserId   = params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const currentUserId = session.user.id;
  const otherUserId   = await params.userId;
  const { content }   = await request.json();

  try {
    const newMessage = await Message.create({
      senderId:     currentUserId,
      recipientId:  otherUserId,
      content:      content.trim(),
    });

    /* ── notify recipient ─────────────────────────────────────── */
    if (otherUserId !== currentUserId) {
      await createNotification(
        otherUserId,
        `New message from ${session.user.name || 'someone'}`,
        `/messages/${currentUserId}`
      );
    }

    /* ── live broadcast (if sockets initialised) ─────────────── */
    try {
      const io = getIO();              // throws if not initialised
      io.to(otherUserId).emit('message:new', newMessage);
      io.to(currentUserId).emit('message:new', newMessage);
    } catch {
      /* no socket clients connected – nothing to emit */
    }

    return NextResponse.json(
      { message: 'Message sent', newMessage },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error sending message:', err);
    return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
  }
}
