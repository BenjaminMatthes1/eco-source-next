import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import connectToDatabase from '@/lib/mongooseClientPromise';
import Product from '@/models/Product';
import { deleteFileFromS3 } from '@/lib/s3Upload'; // if removing from S3

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string; docId: string } }
) {
  const { productId, docId } = await params;

  // 1) Read token from cookies
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // optional role check:
  // if (token.role !== 'admin') ...

  // 2) Connect DB & find product
  await connectToDatabase();
  const product = await Product.findById(productId);
  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  // optional: check if product.userId matches token.id or token.role === 'admin'

  // 3) Locate doc by docId
  // Make sure product.uploadedDocuments subdoc has `_id` e.g. { _id: { type: Schema.Types.ObjectId, auto: true }, ... }
  const docIndex = product.uploadedDocuments.findIndex((doc: any) => {
    return doc._id.toString() === docId;
  });
  if (docIndex === -1) {
    return NextResponse.json({ message: 'Document not found' }, { status: 404 });
  }

    // (Optional) If you want to remove the actual file from S3, do something like:
    const docToDelete = product.uploadedDocuments[docIndex];
    const s3KeyOrUrl = docToDelete.url;
    await deleteFileFromS3(s3KeyOrUrl);



  // 4) Remove from array, save
  product.uploadedDocuments.splice(docIndex, 1);
  await product.save();

  return NextResponse.json({ message: 'Document deleted' }, { status: 200 });
}



