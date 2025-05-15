import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Product from '@/models/Product';
import { uploadFileToS3 } from '@/lib/s3Upload'; // assumed existing helper
import mongoose from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1) Find product
    const { productId } = await params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 2) Ensure the requesting user is the owner (or check admin)
    //    Adjust logic as needed (e.g. token.role === 'admin')
    if (product.userId.toString() !== token.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3) Enforce max 10 photos
    if (product.photos.length >= 10) {
      return NextResponse.json({ error: 'Max photo limit reached' }, { status: 400 });
    }

    // 4) Parse incoming file
    // Example with a Busboy-like approach:
    // If you have a custom solution, adapt accordingly.
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

    // 5) Upload to S3: store in 'productphotos/' subfolder
    const extension = file.name?.split('.').pop() || 'jpg';
    const generatedKey = `productphotos/${productId}-${Date.now()}.${extension}`;

    const s3Url = await uploadFileToS3(fileBuffer, generatedKey, mimeType);
    // uploadFileToS3 should return the full S3 URL or throw an error

    // 6) Create subdoc in `photos`
    // Name is optional; you can store file.name or something else
    const newPhoto = {
      url: s3Url,
      key: generatedKey,
      name: file.name || '',
    };

    product.photos.push(newPhoto);
    await product.save();

    // 7) Return the newly created photo subdoc (with Mongo _id)
    // The new subdoc is the last element in the array
    const createdPhoto = product.photos[product.photos.length - 1];
    return NextResponse.json(createdPhoto, { status: 201 });

  } catch (error: any) {
    console.error('Error uploading product photo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
