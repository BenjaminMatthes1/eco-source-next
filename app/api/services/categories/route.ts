// app/api/services/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service from '@/models/Service';

export async function GET(request: NextRequest) {
  await connectToDatabase();

  try {
    const categories = await Service.distinct('category');
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}
