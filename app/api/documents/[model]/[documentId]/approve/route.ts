// app/api/documents/[model]/[documentId]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product from '@/models/Product';
import Service from '@/models/Service';
import User from '@/models/User';

export async function POST(
  request: NextRequest,
  context: { params: { model: string; documentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await connectToDatabase();
  const { model, documentId } = context.params;

  let parent: any;
  switch (model) {
    case 'product':
      parent = await Product.findOne({ 'uploadedDocuments._id': documentId });
      break;
    case 'service':
      parent = await Service.findOne({ 'uploadedDocuments._id': documentId });
      break;
    case 'user':
      parent = await User.findOne({ 'uploadedDocuments._id': documentId });
      break;
    default:
      return NextResponse.json({ message: 'Invalid model' }, { status: 400 });
  }

  if (!parent) {
    return NextResponse.json({ message: 'Document not found' }, { status: 404 });
  }

  // find the subdoc
  const doc = parent.uploadedDocuments.id(documentId);
  if (!doc) {
    return NextResponse.json({ message: 'Document not found in parent' }, { status: 404 });
  }

  doc.verified = true;
  doc.rejectionReason = ''; // clear any old rejections
  await parent.save();

  return NextResponse.json({ message: 'Document approved' }, { status: 200 });
}
