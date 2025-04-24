// app/api/users/[userId]/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications } from '@/services/notificationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: NextRequest, context: any) {
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
