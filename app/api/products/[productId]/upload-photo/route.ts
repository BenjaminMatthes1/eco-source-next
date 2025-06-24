import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth/next';
import { authOptions }               from '@/lib/authOptions';

import connectToDatabase from '@/lib/mongooseClientPromise';
import Product           from '@/models/Product';
import { uploadFileToS3 } from '@/lib/s3Upload';
import mongoose          from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  /* ── 1. auth via session cookie ──────────────────────────────── */
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;                // logged-in user id

  /* ── 2. load product & authorise ─────────────────────────────── */
  await connectToDatabase();

  const { productId } = await params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (product.userId.toString() !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (product.photos.length >= 10) {
    return NextResponse.json({ error: 'Max photo limit reached' }, { status: 400 });
  }

  /* ── 3. extract the file from <formData> ─────────────────────── */
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer    = Buffer.from(await file.arrayBuffer());
  const mimeType  = file.type || 'application/octet-stream';
  const ext       = file.name?.split('.').pop() || 'jpg';
  const key       = `productphotos/${productId}-${Date.now()}.${ext}`;

  const url       = await uploadFileToS3(buffer, key, mimeType);

  /* ── 4. persist in DB & return sub-doc ───────────────────────── */
  product.photos.push({ url, key, name: file.name ?? '' });
  await product.save();

  return NextResponse.json(product.photos.at(-1), { status: 201 });
}
