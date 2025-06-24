import { NextRequest, NextResponse }  from 'next/server';
import { getServerSession }           from 'next-auth/next';
import { authOptions }                from '@/lib/authOptions';
import connectToDatabase              from '@/lib/mongooseClientPromise';
import Service, { IService }          from '@/models/Service';
import mongoose, { Types }            from 'mongoose';
import { createNotification }         from '@/services/notificationService';

/* ─────────────────────────────────────────────────────────── */
/* GET – all reviews                                           */
/* ─────────────────────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  await connectToDatabase();
  const { serviceId } = await params;

  const svc = await Service.findById<IService>(serviceId)
    .select('reviews')
    .populate('reviews.userId', 'name profilePictureUrl')
    .lean();

  if (!svc) {
    return NextResponse.json({ message: 'Service not found' }, { status: 404 });
  }

  return NextResponse.json({ reviews: svc.reviews }, { status: 200 });
}

/* ─────────────────────────────────────────────────────────── */
/* POST – add a review                                         */
/* ─────────────────────────────────────────────────────────── */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const caller = session.user.name ?? 'Someone';

  /* body validation ------------------------------------------ */
  const { rating, comment, photos = [] } = await request.json();
  const ratingNum = Number(rating);
  const validInc  =
    Math.abs(ratingNum * 2 - Math.round(ratingNum * 2)) < 1e-6;

  if (
    Number.isNaN(ratingNum) ||
    ratingNum < 0.5 ||
    ratingNum > 5 ||
    !validInc
  ) {
    return NextResponse.json(
      { message: 'Rating must be a 0.5-step value between 0.5 and 5' },
      { status: 400 }
    );
  }
  if (!comment?.trim()) {
    return NextResponse.json({ message: 'Comment required' }, { status: 400 });
  }

  /* fetch service -------------------------------------------- */
  const svc = await Service.findById<IService>(serviceId);
  if (!svc) {
    return NextResponse.json({ message: 'Service not found' }, { status: 404 });
  }
  if (svc.userId.toString() === userId) {
    return NextResponse.json(
      { message: 'Owners cannot review their own service' },
      { status: 403 }
    );
  }
  if (svc.reviews.some(r => r.userId.toString() === userId)) {
    return NextResponse.json(
      { message: 'You have already reviewed this service' },
      { status: 409 }
    );
  }

  /* push review ---------------------------------------------- */
  svc.reviews.push({
    userId: new Types.ObjectId(userId),
    rating: ratingNum,
    comment,
    createdAt: new Date(),
    photos,
  });
  await svc.save();

  /* notify owner --------------------------------------------- */
  await createNotification(
    svc.userId.toString(),
    `${caller} reviewed your service "${svc.name}"`,
    `/services/${svc._id}`
  );

  /* return the new review ------------------------------------ */
  const doc = await Service.findById(serviceId)
  .select('reviews')
  .populate('reviews.userId', 'name profilePictureUrl')
  .lean<Pick<IService, 'reviews'>>()          // 👈 tell TS what comes back

  const newReview = doc?.reviews.at(-1);
  return NextResponse.json({ review: newReview }, { status: 201 });
}
