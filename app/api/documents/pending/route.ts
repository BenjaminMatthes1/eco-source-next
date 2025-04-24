// app/api/documents/pending/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product from '@/models/Product';
import Service from '@/models/Service';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await connectToDatabase();

  // 1) Find all products that have unverified docs
  const products = await Product.find({ 'uploadedDocuments.verified': false }).lean();
  // Flatten out the docs that are unverified
  const productDocs = products.flatMap((prod: any) => {
    // filter unverified
    const unverified = prod.uploadedDocuments.filter((d: any) => !d.verified);
    // For each doc, return an object referencing the doc + model + parentId
    return unverified.map((doc: any) => ({
      model: 'product',
      parentId: prod._id.toString(),
      documentId: doc._id.toString(), // if each doc has its own _id
      name: doc.name,
      url: doc.url,
      category: doc.category,
      verified: doc.verified,
      rejectionReason: doc.rejectionReason || '',
      uploadedAt: doc.uploadedAt,
    }));
  });

  // 2) Similarly for services
  const services = await Service.find({ 'uploadedDocuments.verified': false }).lean();
  const serviceDocs = services.flatMap((svc: any) => {
    const unverified = svc.uploadedDocuments.filter((d: any) => !d.verified);
    return unverified.map((doc: any) => ({
      model: 'service',
      parentId: svc._id.toString(),
      documentId: doc._id.toString(),
      name: doc.name,
      url: doc.url,
      category: doc.category,
      verified: doc.verified,
      rejectionReason: doc.rejectionReason || '',
      uploadedAt: doc.uploadedAt,
    }));
  });

  // 3) Similarly for users (if user.uploadedDocuments or user.ersMetrics.userUploadedDocs)
  const users = await User.find({ 'uploadedDocuments.verified': false }).lean();
  const userDocs = users.flatMap((usr: any) => {
    const unverified = usr.uploadedDocuments.filter((d: any) => !d.verified);
    return unverified.map((doc: any) => ({
      model: 'user',
      parentId: usr._id.toString(),
      documentId: doc._id.toString(),
      name: doc.name,
      url: doc.url,
      category: doc.category,
      verified: doc.verified,
      rejectionReason: doc.rejectionReason || '',
      uploadedAt: doc.uploadedAt,
    }));
  });

  const allPendingDocs = [...productDocs, ...serviceDocs, ...userDocs];

  return NextResponse.json({ pending: allPendingDocs }, { status: 200 });
}
