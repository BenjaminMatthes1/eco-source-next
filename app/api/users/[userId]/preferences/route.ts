// app/api/users/[userId]/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = params;

  // Ensure the user can only update their own preferences
  if (session.user.id !== userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { preferences } = await request.json();

  try {
    // Update the user's preferences in their profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: { preferences } },
      { new: true }
    ).exec();

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ message: 'Error updating preferences' }, { status: 500 });
  }
}
