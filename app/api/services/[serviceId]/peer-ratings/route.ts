import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service from '@/models/Service';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  await connectToDatabase();

  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = token.sub; // The logged-in user's ID

  try {
    const { serviceId } = params;
    const { metric, rating } = await request.json();

    // We only allow costEffectiveness or economicViability
    if (!['costEffectiveness', 'economicViability'].includes(metric)) {
      return NextResponse.json({ message: 'Invalid metric' }, { status: 400 });
    }
    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      return NextResponse.json({ message: 'Rating must be 1..10' }, { status: 400 });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    // Disallow the owner from rating their own service
    if (service.userId.toString() === userId) {
      return NextResponse.json({ message: 'Cannot rate your own service' }, { status: 403 });
    }

    // Find existing rating from this user
    const existing = service.peerRatings[metric].find(
      (r: { userId: mongoose.Types.ObjectId; rating: number }) =>
        r.userId.toString() === userId
    );

    if (existing) {
      existing.rating = ratingNum;
    } else {
      service.peerRatings[metric].push({
        userId: new mongoose.Types.ObjectId(userId),
        rating: ratingNum,
      });
    }

    // Recompute average + count
    const allRatings = service.peerRatings[metric];
    const count = allRatings.length;
    const sum = allRatings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
    const average = sum / count;

    // Save synergy => metrics[metric] = { average, count }
    if (!service.metrics) {
      service.metrics = {};
    }
    service.metrics.set(metric, { average, count });

    await service.save();

    return NextResponse.json({ message: 'Rating submitted', service }, { status: 200 });
  } catch (err: any) {
    console.error('Peer rating error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
