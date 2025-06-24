// app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// If you want to compute ERS on the server side:
import { calculateERSItemScore } from '@/services/ersMetricsService';
// Otherwise, remove the import if you plan to compute ERS only on the client.

//
// POST => Create a new product
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
      price,
      categories,
      chosenMetrics,
      metrics,             // new dynamic fields
      photos,
      uploadedDocuments,
    } = data;

    // Basic validation
    if (!name || !description || typeof price !== 'number') {
      return NextResponse.json(
        { message: 'Name, description, and valid price are required.' },
        { status: 400 }
      );
    }

    // Optionally compute an ERS score from `chosenMetrics`  `metrics`
    // You must update your `calculateERSProductScore` to handle the new approach.
    const ersScore = calculateERSItemScore({ chosenMetrics, metrics });

    const product = new Product({
      userId: new mongoose.Types.ObjectId(session.user.id),
      name,
      description,
      price,
      categories: categories || [],
      chosenMetrics: chosenMetrics || [],
      metrics: metrics || {},

      photos: photos || [],
      uploadedDocuments: uploadedDocuments || [],

      // If storing the computed score in the DB, add e.g. `ersScore: ersScore,`
    });

    await product.save();

    return NextResponse.json(
      { message: 'Product created', product, ersScore },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Error creating product' }, { status: 500 });
  }
}

//
// GET => List all products (optionally filter by category)
//
export async function GET(request: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const search   = searchParams.get('q')        || '';      // keyword
  const category = searchParams.get('category') || '';
  const minRaw = searchParams.get('minPrice');
  const maxRaw = searchParams.get('maxPrice');
  const minPrice = minRaw ? Number(minRaw) : undefined;
  const maxPrice = maxRaw ? Number(maxRaw) : undefined;

  /* ---------- build Mongo query ---------- */
  const query: any = {};

  // category (array field "categories")
  if (category) query.categories = category;

  // keyword regex on name OR description (case-insensitive)
  if (search.trim()) {
    query.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  try {
    const raw = await Product.find(query)
      .select('name description price photos chosenMetrics metrics')
      .lean();

    // ensure overallScore
    const { calculateERSItemScore } = await import('@/services/ersMetricsService');
    const products = raw.map((p: any) => {
      if (!p.metrics) p.metrics = {};
      if (p.metrics.overallScore === undefined) {
        p.metrics.overallScore = Math.round(
          calculateERSItemScore({
            chosenMetrics: p.chosenMetrics ?? [],
            metrics:       p.metrics,
          }).score
        );
      }
      return { ...p, photos: p.photos ?? [] };  // guarantee array
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json(
      { message: 'Error fetching products' },
      { status: 500 }
    );
  }
}