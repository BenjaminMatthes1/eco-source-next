import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service from '@/models/Service';
// If using next-auth token approach:
import { getToken } from 'next-auth/jwt';
// If you want to remove from S3, import deleteFileFromS3 from '@/lib/s3Upload';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceId: string; docId: string } }
) {
  const { serviceId, docId } = await params;

  // 1) Auth check (if using next-auth, we get token):
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Optionally, if you want only the service owner or admin to delete:
  // if (token.role !== 'admin') { ... } or fetch the service and compare userId to token.id

  try {
    // 2) DB connect & find service
    await connectToDatabase();
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }

    // 3) Find doc by _id
    const docIndex = service.uploadedDocuments.findIndex((doc: any) => {
      return doc._id?.toString() === docId;
    });
    if (docIndex === -1) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // (Optional) Remove from S3 if desired:
    // const docToDelete = service.uploadedDocuments[docIndex];
    // await deleteFileFromS3(docToDelete.keyOrUrl);

    // 4) Splice out the doc from the array, save
    service.uploadedDocuments.splice(docIndex, 1);
    await service.save();

    return NextResponse.json({ message: 'Document deleted' }, { status: 200 });
  } catch (err: any) {
    console.error('Error deleting service doc:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
