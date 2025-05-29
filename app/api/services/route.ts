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
  const search   = searchParams.get('q') || '';          // keyword
  const minPrice = Number(searchParams.get('minPrice'));
  const maxPrice = Number(searchParams.get('maxPrice'));
  const category = searchParams.get('category');

  const query: any = {};
  if (category) {
    query.category = category;
    if (search)   query.$text = { $search: search };       // needs Mongo text index
      if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        query.price = {};
        if (!isNaN(minPrice)) query.price.$gte = minPrice;
        if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
      }
    }
  try {
    // Return all or filtered services
    // Optionally select fields
    const services = await Service.find(query).lean();
    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ message: 'Error fetching services' }, { status: 500 });
  }
}
