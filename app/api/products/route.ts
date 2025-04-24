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

    // Optionally compute an ERS score from `chosenMetrics` + `metrics`
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
  const category = searchParams.get('category');

  const query: any = {};
  if (category) {
    query.categories = category;
  }

  try {
    // You can control which fields to select
    // or just return everything
    const products = await Product.find(query).lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}
