import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product, { IProduct } from '@/models/Product';  // import your typed Product
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// If you want to recalc a product score after a review:
// import { calculateERSProductScore } from '@/services/ersMetricsService';

//
// GET => Retrieve all reviews for the product
//
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  await connectToDatabase();

  try {
    const { productId } = params;
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
  { params }: { params: { productId: string } }
) {
  await connectToDatabase();

  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = params;
    // We expect { rating, comment } in the body
    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    if (!comment) {
      return NextResponse.json(
        { message: 'Comment is required' },
        { status: 400 }
      );
    }

    /**
     * Fetch the product doc as an IProduct, not lean,
     * so we can modify (push reviews) and save.
     */
    const productDoc = await Product.findById<IProduct>(productId);
    if (!productDoc) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Add the new review
    productDoc.reviews.push({
      userId: new mongoose.Types.ObjectId(session.user.id),
      rating,
      comment,
      createdAt: new Date(),
    });

    // Optionally recalc a product ERS score from reviews or other logic:
    // const newScore = calculateERSProductScore({
    //   // gather product fields, incorporate average rating if needed
    // });
    // productDoc.ersScore = newScore;

    // Save
    await productDoc.save();

    return NextResponse.json(
      { message: 'Review added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ message: 'Error adding review' }, { status: 500 });
  }
}
