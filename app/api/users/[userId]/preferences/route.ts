// app/api/users/[userId]/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User'; // Import User model
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function PUT(request: NextRequest, context: any) {
  const params = await context.params;
  const userId = params.userId;

  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Ensure the user can only update their own preferences
  if (session.user.id !== userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { preferences } = await request.json();

    // Update the user's preferences
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true }
    ).exec();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Exclude sensitive fields like password before sending the response
    const userObj = user.toObject() as any;
    const { password, __v, ...userData } = userObj;

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ message: 'Error updating preferences' }, { status: 500 });
  }
}
