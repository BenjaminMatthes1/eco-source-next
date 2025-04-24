// app/api/users/[userId]/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// POST => Create a new Product for userId
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }   // ← note Promise
) {
  const { userId } = await params;   
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.id !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    // synergy + old fields
    const {
      chosenMetrics,
      metrics,
      name,
      description,
      price,
      categories,
      images,
    } = body;

    if (!name || typeof price !== 'number') {
      return NextResponse.json(
        { message: 'Name and numeric price are required' },
        { status: 400 }
      );
    }

    const product = new Product({
      userId: new mongoose.Types.ObjectId(userId),
      name,
      description,
      price,
      categories,
      images,

      // synergy
      chosenMetrics: Array.isArray(chosenMetrics) ? chosenMetrics : [],
      metrics: metrics || {},
    });

    await product.save();

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Error creating product' }, { status: 500 });
  }
}

// PUT => Update an existing Product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }   // ← note Promise
) {
  const { userId } = await params;   
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.id !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      productId,
      chosenMetrics,
      metrics,
      name,
      description,
      price,
      categories,
      images,
    } = body;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, userId },
      {
        name,
        description,
        price,
        categories,
        images,

        // synergy
        chosenMetrics: Array.isArray(chosenMetrics) ? chosenMetrics : [],
        metrics: metrics || {},
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Product updated successfully', product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

// GET => List all products for a given user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }   // ← note Promise
) {
  const { userId } = await params;   
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.id !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const products = await Product.find({ userId }).sort({ createdAt: -1 });

    // Not strictly an error if zero products. Return an empty array or a message
    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products found', products: [] }, { status: 200 });
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}
