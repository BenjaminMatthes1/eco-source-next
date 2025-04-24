// app/api/services/[serviceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service from '@/models/Service';
import { calculateERSItemScore } from '@/services/ersMetricsService';
mongoose.set('strictPopulate', false);

//
// GET => Fetch a single service
//
export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  await connectToDatabase();
  

  try {
    const { serviceId } = await params;
    const service = await Service.findById(serviceId)
    .populate({
      path: 'userId',
      select: 'name profilePictureUrl', // or select other fields
    })
    

    if (!service) {
      return NextResponse.json({ message: 'Service not found.' }, { status: 404 });
    }

    return NextResponse.json({ service }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ message: 'Error fetching service' }, { status: 500 });
  }
}

//
// PUT => Update an existing service
//
export async function PUT(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  await connectToDatabase();
  const { serviceId } = params;

  try {
    const body = await request.json();
    const {
      name,
      description,
      categories,
      chosenMetrics,
      metrics,
      photos,
      uploadedDocuments,
      // etc.
    } = body;

    if (!name || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ message: 'Name and categories are required.' }, { status: 400 });
    }

    const updatedScore = calculateERSItemScore({ chosenMetrics, metrics });

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        name,
        description,
        categories,
        chosenMetrics,
        metrics,
        photos,
        uploadedDocuments,
        // ersScore: updatedScore,
      },
      { new: true }
    );

    if (!updatedService) {
      return NextResponse.json({ message: 'Service not found.' }, { status: 404 });
    }

    return NextResponse.json({ service: updatedService, ersScore: updatedScore }, { status: 200 });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ message: 'Error updating service.' }, { status: 500 });
  }
}