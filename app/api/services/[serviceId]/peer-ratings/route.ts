import { NextRequest, NextResponse }  from 'next/server';
import { getServerSession }           from 'next-auth/next';
import { authOptions }                from '@/lib/authOptions';
import connectToDatabase              from '@/lib/mongooseClientPromise';
import Service                        from '@/models/Service';
import mongoose                       from 'mongoose';
import { createNotification }         from '@/services/notificationService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }   // ← Promise
) {
  const { serviceId } = await params;                      // ← await once
  await connectToDatabase();

  /* session ---------------------------------------------------- */
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const caller = session.user.name ?? 'Someone';

  /* body ------------------------------------------------------- */
  const { metric, rating } = await request.json();
  if (!['costEffectiveness', 'economicViability'].includes(metric)) {
    return NextResponse.json({ message: 'Invalid metric' }, { status: 400 });
  }
  const ratingNum = Number(rating);
  if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
    return NextResponse.json(
      { message: 'Rating must be 1–10' },
      { status: 400 }
    );
  }

  /* doc -------------------------------------------------------- */
  const service = await Service.findById(serviceId);
  if (!service) {
    return NextResponse.json({ message: 'Service not found' }, { status: 404 });
  }
  if (service.userId.toString() === userId) {
    return NextResponse.json(
      { message: 'Cannot rate your own service' },
      { status: 403 }
    );
  }

  /* push / update rating -------------------------------------- */
  const existing = service.peerRatings[metric].find(
    (r: { userId: mongoose.Types.ObjectId; rating: number }) =>
      r.userId.toString() === userId
  );

  if (existing) existing.rating = ratingNum;
  else
    service.peerRatings[metric].push({
      userId: new mongoose.Types.ObjectId(userId),
      rating: ratingNum,
    });

  /* recompute average / count --------------------------------- */
  const all   = service.peerRatings[metric];
  const count = all.length;
  const sum   = all.reduce(
    (acc: number, r: { rating: number }) => acc + r.rating,
    0
  );
  const avg = sum / count;

  if (!service.metrics) service.metrics = {};
  service.metrics.set(metric, { average: avg, count });

  await service.save();

  /* notify owner ---------------------------------------------- */
  await createNotification(
    service.userId.toString(),
    `${caller} rated your service "${service.name}"`,
    `/services/${service._id}`
  );

  return NextResponse.json(
    { message: 'Rating submitted', service },
    { status: 200 }
  );
}
