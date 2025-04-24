// app/api/services/[serviceId]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service from '@/models/Service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// If you'd like to incorporate reviews into your scoring logic:
import { calculateERSServiceScore } from '@/services/ersMetricsService';

//
// GET => get all reviews for a given service
//
export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  await connectToDatabase();

  try {
    const { serviceId } = await params;
    const service = await Service.findById(serviceId)
      .select('reviews')
      .populate({
        path: 'reviews.userId',
        select: 'name',
      });
      
      

    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ reviews: service.reviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service reviews:', error);
    return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
  }
}

//
// POST => add a new review
//
export async function POST(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { serviceId } = await params;
    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    // Add the new review
    service.reviews.push({
      userId: new mongoose.Types.ObjectId(session.user.id),
      rating,
      comment,
      createdAt: new Date(),
    });

    // If your service's score depends on reviews, you can recalc here:
    // const newScore = calculateERSServiceScore(...);

    await service.save();

    return NextResponse.json({ message: 'Review added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ message: 'Error adding review' }, { status: 500 });
  }
}
