// app/api/users/[userId]/activity-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const { userId } = params;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 20;

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Ensure only the user or an admin can access the logs
  if (session.user.id !== userId /* && !session.user.isAdmin */) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    // Fetch activity logs for the specified user
    const logs = await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ message: 'Error fetching activity logs' }, { status: 500 });
  }
}
