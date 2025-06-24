import { NextRequest, NextResponse } from 'next/server';
import mongoose, {Types} from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product, { IProduct } from '@/models/Product';  // import your typed Product
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { createNotification } from '@/services/notificationService';


// If you want to recalc a product score after a review:
// import { calculateERSProductScore } from '@/services/ersMetricsService';

//
// GET => Retrieve all reviews for the product
//
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }   // ← Promise
) {
  await connectToDatabase();

  try {
    const { productId } = await params;
    /**
     * Use a typed call if you want strongly typed result:
     * findById<IProduct>(productId)
     */
    const product = await Product.findById<IProduct>(productId)
      .select('reviews')
      .populate({
        path: 'reviews.userId',
        select: 'name',  // what fields from User do you want?
      })
      .lean(); // returns a plain JS object, not a mongoose doc

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Return the reviews
    // product.reviews is typed as an array of subdocs
    return NextResponse.json({ reviews: product.reviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
  }
}

//
// POST => Add a new review
//
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }   // ← Promise
) {
  const { productId } = await params;        
  await connectToDatabase();

  /* 1. who is the caller?  */
 const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const caller  = session.user.name ?? 'Someone';  // human-readable name            // logged-in user id (string)

  /* 2. validate body */
  const { rating, comment, photos = [] } = await request.json();
    const ratingNum = Number(rating);              // ← convert once

    // accept 0.5 increments between 0.5 and 5
    const validIncrement = Math.abs(ratingNum * 2 - Math.round(ratingNum * 2)) < 1e-6;

    if (
      Number.isNaN(ratingNum)                ||
      ratingNum < 0.5 || ratingNum > 5       ||
      !validIncrement                        // 0.5‑step guard
    ) {
        return NextResponse.json(
      { message: 'Rating must be a 0.5‑step value between 0.5 and 5' },
      { status: 400 }
    );
  }
  if (!comment?.trim()) {
    return NextResponse.json({ message: 'Comment required' }, { status: 400 });
  }
    
  if (!comment?.trim()) {
    return NextResponse.json(
      { message: 'Comment is required.' },
      { status: 400 }
    );
  }

  /* 3. fetch the product doc (NOT lean) */
  const productDoc = await Product.findById<IProduct>(productId);
  if (!productDoc) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  /* 4-a. block the owner */
  if (productDoc.userId.toString() === userId) {
    return NextResponse.json(
      { message: 'You cannot review your own product.' },
      { status: 403 }
    );
  }

  /* 4-b. block duplicate reviews */
  const duplicate = productDoc.reviews.some(
    (r) => r.userId.toString() === userId
  );
  if (duplicate) {
    return NextResponse.json(
      { message: 'You have already reviewed this product.' },
      { status: 409 }
    );
  }

  /* 5. push the new review & save */
  productDoc.reviews.push({
    userId: new Types.ObjectId(userId),
    rating,
    comment,
    createdAt: new Date(),
    photos,
  });

  await productDoc.save();

  // real-time notification to owner (again, skip self-review)
    if (productDoc.userId.toString() !== userId) {
      await createNotification(
        productDoc.userId.toString(),
        `${caller} reviewed your product "${productDoc.name}"`,
        `/products/${productDoc._id}`
      );
    }

  
  const doc = await Product.findById(productId)
  .select('reviews')
  .populate('reviews.userId', 'name profilePictureUrl')
  .lean();

    if (!doc || Array.isArray(doc)) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const { reviews } = doc;
    const newReview   = reviews.at(-1);

    return NextResponse.json({ review: newReview }, { status: 201 });
  
}
