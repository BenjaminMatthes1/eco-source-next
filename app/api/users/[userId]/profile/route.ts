// app/api/users/[userId]/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const { userId } = params;

  try {
    // Fetch the profile based on the userId
    const profile = await Profile.findOne({ userId }).exec();

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Error fetching profile' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const { userId } = params;

  if (!session || session.user.id !== userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const updatedData = await request.json();

  try {
    // Update the user's profile with the provided data
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true }
    ).exec();

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated', profile }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}
