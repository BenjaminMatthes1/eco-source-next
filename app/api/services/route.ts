// app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service from '@/models/Service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// If you want to compute a numeric Service ERS score:
import { calculateERSItemScore } from '@/services/ersMetricsService';

//
// POST => Create a new service
//
export async function POST(request: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      name,
      description,
      categories,
      // Possibly a standard field like "price" or "serviceCost" 
      // if you want to keep it top-level
      serviceCost,
      // NEW dynamic approach
      chosenMetrics,
      metrics,
      photos,
      uploadedDocuments,
    } = data;

    if (!name || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { message: 'Name and at least one category are required.' },
        { status: 400 }
      );
    }

    // If you want a numeric service cost, parse from metrics or from the "price" field
    // e.g. let serviceCost = metrics?.serviceCost ?? 0;

    const ersScore = calculateERSItemScore({ chosenMetrics, metrics });

    const service = new Service({
      userId: new mongoose.Types.ObjectId(session.user.id),
      name,
      price: serviceCost,
      description,
      categories,
      chosenMetrics: chosenMetrics || [],
      metrics: metrics || {},
      photos: photos || [],
      uploadedDocuments: uploadedDocuments || [],
      // ersScore: ersScore, // if you store it
    });

    await service.save();

    return NextResponse.json({ message: 'Service created', service, ersScore }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ message: 'Error creating service' }, { status: 500 });
  }
}


//
// GET => List all services (optionally filter by category)
//
export async function GET(request: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const search   = searchParams.get('q')        || '';
  const category = searchParams.get('category') || '';
  const minRaw = searchParams.get('minPrice');
  const maxRaw = searchParams.get('maxPrice');
  const minPrice = minRaw ? Number(minRaw) : undefined;
  const maxPrice = maxRaw ? Number(maxRaw) : undefined;

  /* ---------- build query ---------- */
  const query: any = {};

  // single-value category field
  if (category) query.category = category;

  // keyword on name / description
  if (search.trim()) {
    query.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // cost range  (rename "price" to "serviceCost" if that’s your schema field)
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  try {
    const raw = await Service.find(query)
      .select('name description category price photos chosenMetrics metrics')
      .lean();

    const { calculateERSItemScore } = await import('@/services/ersMetricsService');
    const services = raw.map((s: any) => {
      if (!s.metrics) s.metrics = {};
      if (s.metrics.overallScore === undefined) {
        s.metrics.overallScore = Math.round(
          calculateERSItemScore({
            chosenMetrics: s.chosenMetrics ?? [],
            metrics:       s.metrics,
          }).score
        );
      }
      return s;
    });

    return NextResponse.json({ services }, { status: 200 });
  } catch (err) {
    console.error('Error fetching services:', err);
    return NextResponse.json(
      { message: 'Error fetching services' },
      { status: 500 }
    );
  }
}