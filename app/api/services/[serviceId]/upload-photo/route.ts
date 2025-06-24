import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }          from 'next-auth/next';
import { authOptions }               from '@/lib/authOptions';

import connectToDatabase from '@/lib/mongooseClientPromise';
import Service           from '@/models/Service';
import { uploadFileToS3 } from '@/lib/s3Upload';
import mongoose          from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  /* ── 1. auth via session cookie ──────────────────────────────── */
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  /* ── 2. load service & authorise ─────────────────────────────── */
  await connectToDatabase();

  const { serviceId } = params;
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return NextResponse.json({ error: 'Invalid serviceId' }, { status: 400 });
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
  if (service.userId.toString() !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (service.photos.length >= 10) {
    return NextResponse.json({ error: 'Max photo limit reached' }, { status: 400 });
  }

  /* ── 3. extract <file> from multipart ────────────────────────── */
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer    = Buffer.from(await file.arrayBuffer());
  const mimeType  = file.type || 'application/octet-stream';
  const ext       = file.name?.split('.').pop() || 'jpg';
  const key       = `servicephotos/${serviceId}-${Date.now()}.${ext}`;

  const url       = await uploadFileToS3(buffer, key, mimeType);

  /* ── 4. persist & respond ───────────────────────────────────── */
  service.photos.push({ url, key, name: file.name ?? '' });
  await service.save();

  return NextResponse.json(service.photos.at(-1), { status: 201 });
}
