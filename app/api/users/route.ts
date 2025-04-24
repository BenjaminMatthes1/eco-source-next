// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';



export async function GET(request: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const userCategory = searchParams.get('userCategory');

  const query: any = {};

  if (userCategory) {
    query.userCategory = userCategory;
  }

  try {
    const users = await User.find(query).select('name bio profilePictureUrl userCategory');
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
