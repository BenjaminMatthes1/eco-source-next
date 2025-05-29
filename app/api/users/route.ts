// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';
import { calculateUserLevelScore } from '@/services/ersMetricsService';


export async function GET(request: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const userCategory = searchParams.get('userCategory');
  const search       = searchParams.get('q') || '';
  const role         = searchParams.get('role');
  
 
  const query: any = {};
  if (role)         query.role = role;
  if (search)       query.$text = { $search: search };   // add index on name bio

  if (userCategory) {
    query.userCategory = userCategory;
  }
  

  try {
     const rawUsers = await User.find(query)
    .select(
      'name bio role location profilePictureUrl companyName ' +
      'createdAt chosenMetrics metrics'            // ← include full metrics obj
    )
    .lean();

    const { calculateUserLevelScore } = await import(
    '@/services/ersMetricsService'
  );    
    // ensure every user has metrics.overallScore
     const users = rawUsers.map((u: any) => {
    if (!u.metrics) u.metrics = {};

    if (u.metrics.overallScore === undefined) {
      u.metrics.overallScore = Math.round(
        calculateUserLevelScore({
          chosenMetrics: u.chosenMetrics ?? [],
          metrics:       u.metrics,
        }).score
      );
    }
    return u;
  });
  
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
  
}
