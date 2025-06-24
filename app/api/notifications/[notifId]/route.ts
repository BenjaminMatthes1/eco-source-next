import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }         from 'next-auth/next';
import { authOptions }              from '@/lib/authOptions';
import connectToDatabase            from '@/lib/mongooseClientPromise';
import Notification, { INotification } from '@/models/Notification';
import { getIO } from '@/lib/socketServer';

/* ───────── DELETE  ─────────────────────────────────────────── */
/* hard-delete; switch to a PATCH flag if you prefer soft-delete */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { notifId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const removed = await Notification.findOneAndDelete<INotification>(
    { _id: params.notifId, userId: session.user.id }
  ).lean();

  if (!removed) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  /* realtime update for other open tabs */
  getIO().to(session.user.id).emit('notification:removed', removed._id);

  return NextResponse.json({ ok: true });
}

/* ───────── PATCH (mark as read) ────────────────────────────── */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { notifId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const updated = await Notification.findOneAndUpdate<INotification>(
    { _id: params.notifId, userId: session.user.id },
    { read: true },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  getIO().to(session.user.id).emit('notification:read', updated._id);

  return NextResponse.json({ ok: true });
}
