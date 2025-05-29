// app/api/users/[userId]/services/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';
import Service from '@/models/Service';

// POST => Create a new Service for userId
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
  
  // Only the user themself or an admin can create
  if (session.user.id !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    // For synergy fields:
    const {
      chosenMetrics,
      metrics,
      // and any existing fields:
      name,
      description,
      categories,
      price,
      // etc. If you had "materials", "energyUsage", etc. – include them:
      
      // etc.
    } = body;

    if (!name || !categories) {
      return NextResponse.json(
        { message: 'Name and category are required' },
        { status: 400 }
      );
    }

    const service = new Service({
      userId: new mongoose.Types.ObjectId(userId),
      name,
      description,
      categories,
      price,

      // synergy approach
      chosenMetrics: Array.isArray(chosenMetrics) ? chosenMetrics : [],
      metrics: metrics || {},
    });

    await service.save();
    return NextResponse.json(
      { message: 'Service created successfully', service },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { message: 'Error creating service' },
      { status: 500 }
    );
  }
}

// PUT => Update an existing Service
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
      serviceId,
      // synergy fields
      chosenMetrics,
      metrics,
      // existing fields
      name,
      description,
      categories,
      price,
    } = body;
    
    // We find the service doc
    const updatedService = await Service.findOneAndUpdate(
      { _id: serviceId, userId },
      {
        name,
        description,
        categories,
        price,

        // synergy
        chosenMetrics: Array.isArray(chosenMetrics) ? chosenMetrics : [],
        metrics: metrics || {},
      },
      { new: true }
    );

    if (!updatedService) {
      return NextResponse.json(
        { message: 'Service not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Service updated successfully', service: updatedService },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ message: 'Error updating service' }, { status: 500 });
  }
}

// GET => List all services for a given user
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (session.user.id !== userId && session.user.role !== 'admin')
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const raw = await Service.find({ userId })
      .select(
        'name description chosenMetrics metrics createdAt' // include createdAt
      )
      .sort({ createdAt: -1 })
      .lean();

    const { calculateERSItemScore } = await import(
      '@/services/ersMetricsService'
    );

    const services = raw.map((s: any) => {
      if (!s.metrics) s.metrics = {};
      if (s.metrics.overallScore === undefined) {
        s.metrics.overallScore = Math.round(
          calculateERSItemScore({
            chosenMetrics: s.chosenMetrics ?? [],
            metrics:       s.metrics,
          }).score
        );
      }
      return s;
    });

    return NextResponse.json({ services }, { status: 200 });
  } catch (err) {
    console.error('Error fetching services:', err);
    return NextResponse.json(
      { message: 'Error fetching services' },
      { status: 500 }
    );
  }
}