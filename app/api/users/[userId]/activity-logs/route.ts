// app/api/users/[userId]/activity-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getActivityLogs } from '@/services/activityLogService';
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
    const activityLogs = await getActivityLogs(userId);
    return NextResponse.json(activityLogs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
