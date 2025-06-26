// app/api/users/[userId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';
import { calculateUserLevelScore } from '@/services/ersMetricsService';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { userId } =  await params;
  // Only allow same user or admin
  if (session.user.id !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    // Fetch user document
    const userDoc = await User.findById(userId).lean();
    if (!userDoc) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!userDoc.chosenMetrics) userDoc.chosenMetrics = [];
    if (!userDoc.metrics) userDoc.metrics = {};
  
    // If you want synergy to see all user docs as one field:
    if (!userDoc.chosenMetrics.includes('uploadedDocuments') && userDoc.uploadedDocuments.length > 0) {
      userDoc.chosenMetrics.push('uploadedDocuments');
    }
    userDoc.metrics['uploadedDocuments'] = userDoc.uploadedDocuments;
  
    return NextResponse.json({ user: userDoc }, { status: 200 });

    return NextResponse.json({ user: userDoc }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user doc:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;
  if (session.user.id !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      bio,
      companyName,
      location,
      preferences,
      chosenMetrics,
      metrics,
      businessSize,
      // etc. any other user fields
    } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Simple updates:
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (companyName !== undefined) user.companyName = companyName;
    if (location !== undefined) user.location = location;
    if (preferences !== undefined) user.preferences = preferences;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    if (businessSize)   user.businessSize = businessSize;

    // Overwrite chosenMetrics & metrics:
    if (chosenMetrics) user.chosenMetrics = chosenMetrics;
    if (metrics) {
      // if you want to merge existing metrics instead, do so, 
      // otherwise just overwrite:
      user.metrics = metrics;
    }
    if (name && name !== user.name) {
      const taken = await User.exists({ name, _id: { $ne: userId } });
      if (taken) {
        return NextResponse.json({ message: 'Name already taken' }, { status: 400 });
      }
      user.name = name;
    }

    // Optionally compute new "user-level" dynamic ERS
    const newUserScore = calculateUserLevelScore({
      chosenMetrics: user.chosenMetrics,
      metrics: user.metrics,
    });
    // If you store that in user.metrics or user.ersMetrics, do so:
    // user.metrics.set('overallScore', newUserScore);
    
    await user.save();

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}