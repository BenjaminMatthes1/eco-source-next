// app/api/products/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  await connectToDatabase();

  try {
    const categories = await Product.distinct('category');
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}
