import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';

export async function GET(
    req: NextRequest,
      ctx: { params: { userId: string } }
) {
  const token = await getToken({ req });          // (optional auth check)
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await ctx.params;      // ← await params once
  await connectToDatabase();
  const user = await User.findById(userId).lean();

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // pick only public fields
  const {
    _id, name, bio, profilePictureUrl, role, companyName,
    website, interests, subscriptionStatus, chosenMetrics, metrics,
  } = user;

  return NextResponse.json(
    { user: { _id, name, bio, profilePictureUrl, role, companyName, website,
              interests, subscriptionStatus, chosenMetrics, metrics } },
    { status: 200 }
  );
}
