import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';

import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service, { IService } from '@/models/Service';

// ─────────────────────────────────────────────────────────
// GET  ➜  return all reviews for this service
// ─────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  await connectToDatabase();

  const { serviceId } = params;

  const svc = await Service.findById<IService>(serviceId)
    .select('reviews')
    .populate({ path: 'reviews.userId', select: 'name profilePictureUrl' })
    .lean();

  if (!svc) {
    return NextResponse.json({ message: 'Service not found' }, { status: 404 });
  }

  return NextResponse.json({ reviews: svc.reviews }, { status: 200 });
}

// ─────────────────────────────────────────────────────────
// POST ➜ add a review (one per user, owner-blocked)
// ─────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  await connectToDatabase();

  /* ── authentication ─────────────────────────────── */
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = token.sub!; // logged-in user

  /* ── validate body ──────────────────────────────── */
  const { rating, comment } = await request.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: 'Rating must be between 1 and 5' },
      { status: 400 }
    );
  }
  if (!comment?.trim()) {
    return NextResponse.json({ message: 'Comment required' }, { status: 400 });
  }

  /* ── fetch & mutate doc ─────────────────────────── */
  const { serviceId } = params;
  const svc = await Service.findById<IService>(serviceId);
  if (!svc) {
    return NextResponse.json({ message: 'Service not found' }, { status: 404 });
  }

  // owner cannot review own service
  if (svc.userId.toString() === userId) {
    return NextResponse.json(
      { message: 'Owners cannot review' },
      { status: 403 }
    );
  }

  // only one review per user
  const duplicate = svc.reviews.find(
    r => r.userId.toString() === userId
  );
  if (duplicate) {
    return NextResponse.json(
      { message: 'You have already reviewed' },
      { status: 409 }
    );
  }

  // push review
  svc.reviews.push({
    userId: new Types.ObjectId(userId),
    rating,
    comment,
    createdAt: new Date()
  });

  await svc.save();

  return NextResponse.json(
    { message: 'Review added successfully' },
    { status: 201 }
  );
}
