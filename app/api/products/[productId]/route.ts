// app/api/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product from '@/models/Product';
import { calculateERSItemScore } from '@/services/ersMetricsService';
mongoose.set('strictPopulate', false);
//
// GET => Fetch a single product by ID
//
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  await connectToDatabase();

  try {
    const { productId } = await params;
    const product = await Product.findById(productId)
    .populate('reviews.userId', 'name profilePictureUrl');
      

    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    // Optionally compute an ERS score on the fly
    // const ersScore = calculateERSProductScore({
    //   renewableMaterialsPercentage: ...,
    //   ...
    // });

    return NextResponse.json({ product /*, ersScore*/ }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}

//
// PUT => Update an existing product
//
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  await connectToDatabase();

  const { productId } = await params;

  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      categories,
      chosenMetrics,
      metrics,
      photos,
      uploadedDocuments,
    } = body;

    if (!name || typeof price !== 'number') {
      return NextResponse.json(
        { message: 'Name and valid price are required.' },
        { status: 400 }
      );
    }

    // Recompute or skip computing if you prefer
    const updatedScore = calculateERSItemScore({ chosenMetrics, metrics });

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        categories,
        chosenMetrics,
        metrics,
        photos,
        uploadedDocuments,
        // ersScore: updatedScore, // if you store it
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ product: updatedProduct, ersScore: updatedScore }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Error updating product.' }, { status: 500 });
  }
}

//
// (Optional) DELETE => Remove a product
//
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { productId: string } }
// ) {
//   await connectToDatabase();
//   try {
//     const { productId } = params;
//     const deleted = await Product.findByIdAndDelete(productId);
//     if (!deleted) {
//       return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
//     }
//     return NextResponse.json({ message: 'Product deleted.' }, { status: 200 });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     return NextResponse.json({ message: 'Error deleting product.' }, { status: 500 });
//   }
// }
