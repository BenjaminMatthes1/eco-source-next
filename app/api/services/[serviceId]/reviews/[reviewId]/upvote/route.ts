import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service from '@/models/Service';
import { createNotification } from '@/services/notificationService';

export async function POST(
  _req: NextRequest,
  { params }: { params: { serviceId: string; reviewId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { serviceId, reviewId } = params;
  const userIdObj = new mongoose.Types.ObjectId(session.user.id);

  /* ── find service & review ─────────────────────────── */
  const service = await Service.findById(serviceId);
  if (!service)
    return NextResponse.json({ message: 'service not found' }, { status: 404 });

  const review: any = service.reviews.id(reviewId); // sub-doc getter
  if (!review)
    return NextResponse.json({ message: 'Review not found' }, { status: 404 });

  /* ── prevent duplicate up-votes ────────────────────── */
  if (review.upvotedBy?.includes(userIdObj))
    return NextResponse.json(
      { message: 'You have already up-voted this review' },
      { status: 400 }
    );

  /* ── push & save ───────────────────────────────────── */
  review.upvotedBy = [...(review.upvotedBy || []), userIdObj];
  review.upvotes   = review.upvotedBy.length;
  await service.save();

  /* ── notify reviewer (skip self-vote) ─────────────── */
  if (review.userId.toString() !== session.user.id) {
    await createNotification(
      review.userId.toString(),
      `${session.user.name || 'Someone'} up-voted your service review`,
      `/services/${service._id}`
    );
  }

  return NextResponse.json(
    { message: 'Review up-voted', upvotes: review.upvotes },
    { status: 200 }
  );
}
