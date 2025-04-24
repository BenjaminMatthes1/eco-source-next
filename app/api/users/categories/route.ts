// app/api/users/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  await connectToDatabase();

  try {
    const categories = await User.distinct('userCategory');
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user categories:', error);
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}
