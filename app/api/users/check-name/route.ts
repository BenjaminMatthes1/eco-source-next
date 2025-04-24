import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const name = req.nextUrl.searchParams.get('name')?.trim();
  if (!name) return NextResponse.json({ available: false });

  const exists = await User.exists({ name });
  return NextResponse.json({ available: !exists });
}
