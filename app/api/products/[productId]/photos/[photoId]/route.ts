import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Product from '@/models/Product';
import { deleteFileFromS3 } from '@/lib/s3Upload'; // optional if you want to remove from S3
import mongoose from 'mongoose';
import { IPhoto } from '@/models/Product';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string; photoId: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, photoId } = params;
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(photoId)) {
      return NextResponse.json({ error: 'Invalid ID(s)' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check ownership unless admin
    if (product.userId.toString() !== token.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the photo subdoc
    const photoIndex = product.photos.findIndex((p: IPhoto) => p._id.toString() === photoId);
    if (photoIndex === -1) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Optional: remove from S3
    const photoKey = product.photos[photoIndex].key;
    await deleteFileFromS3(photoKey); 
    // ^ Only if you want the actual file removed from S3

    // Remove from the array
    product.photos.splice(photoIndex, 1);
    await product.save();

    return NextResponse.json({ message: 'Photo deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting product photo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
