// app/api/users/[userId]/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications } from '@/services/notificationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Notification, { INotification } from '@/models/Notification';
import { getIO }             from '@/lib/socketServer';


export async function GET(request: NextRequest, context: any) {
  await connectToDatabase();
    const params = await context.params;
    const userId = params.userId;

  const session = await getServerSession(authOptions);


  if (!session || session.user.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notifications = await getUserNotifications(userId);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// ◼ PATCH ─ mark read
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { notifId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauth' }, { status: 401 });

  const notif = await Notification.findOneAndUpdate(
    { _id: params.notifId, userId: session.user.id },
    { read: true },
    { new: true }
  ).lean<INotification>();  

  if (!notif) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  // push real-time “read” event
  getIO().to(session.user.id).emit('notification:read', notif._id);

  return NextResponse.json({ ok: true });
}

// ◼ DELETE ─ remove notification
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { notifId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: 'Unauth' }, { status: 401 });

  const removed = await Notification.findOneAndDelete({
    _id: params.notifId,
    userId: session.user.id,
  }).lean<INotification>();  

  if (!removed) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  // push real-time “removed” event
  getIO().to(session.user.id).emit('notification:removed', removed._id);

  return NextResponse.json({ ok: true });
}