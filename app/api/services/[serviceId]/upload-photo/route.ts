import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Service from '@/models/Service';
import { uploadFileToS3 } from '@/lib/s3Upload';
import mongoose from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: { serviceId: string } }) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId } = params;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json({ error: 'Invalid serviceId' }, { status: 400 });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.userId.toString() !== token.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Enforce max 10 photos
    if (service.photos.length >= 10) {
      return NextResponse.json({ error: 'Max photo limit reached' }, { status: 400 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Provide mimeType from `file.type` or a default, e.g. 'image/jpeg'
    const mimeType = file.type || 'application/octet-stream';

    const extension = file.name?.split('.').pop() || 'jpg';
    const generatedKey = `servicephotos/${serviceId}-${Date.now()}.${extension}`;

    // Now call uploadFileToS3 with all three
    const s3Url = await uploadFileToS3(fileBuffer, generatedKey, mimeType);



    // Add to photos
    const newPhoto = {
      url: s3Url,
      key: generatedKey,
      name: file.name || '',
    };
    service.photos.push(newPhoto);
    await service.save();

    // Return newly created photo subdoc
    const createdPhoto = service.photos[service.photos.length - 1];
    return NextResponse.json(createdPhoto, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading service photo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
