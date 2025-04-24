import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Service from '@/models/Service';
import { deleteFileFromS3 } from '@/lib/s3Upload';
import mongoose from 'mongoose';
import { IPhoto } from '@/models/Service';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serviceId: string; photoId: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId, photoId } = params;
    if (!mongoose.Types.ObjectId.isValid(serviceId) || !mongoose.Types.ObjectId.isValid(photoId)) {
      return NextResponse.json({ error: 'Invalid ID(s)' }, { status: 400 });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.userId.toString() !== token.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const photoIndex = service.photos.findIndex((p: IPhoto) => p._id.toString() === photoId);
    if (photoIndex === -1) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Optional S3 deletion
    const photoKey = service.photos[photoIndex].key;
    await deleteFileFromS3(photoKey);

    service.photos.splice(photoIndex, 1);
    await service.save();

    return NextResponse.json({ message: 'Photo deleted' });
  } catch (error: any) {
    console.error('Error deleting service photo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
