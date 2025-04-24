import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // or getToken if you're using that approach
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Product from '@/models/Product';
import Busboy from 'busboy';
import { uploadFileToS3 } from '@/lib/s3Upload';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;

  // 1) (Optional) Auth check
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 2) Connect DB & find product
  await connectToDatabase();
  const product = await Product.findById(productId);
  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  // 3) Prepare Busboy
  const contentType = request.headers.get('content-type') || '';
  const busboy = Busboy({ headers: { 'content-type': contentType } });

  let fileCategory = '';
  let parseError = '';
  let fileUrl = '';
  let fileName = '';

  const filePromises: Promise<void>[] = [];

  await new Promise<void>((resolve, reject) => {
    busboy.on('file', (fieldname, file, info) => {
      if (fieldname !== 'file') return; // your front-end must use formData.append('file', ...)

      const filePromise = new Promise<void>((resolveFile, rejectFile) => {
        const { filename, mimeType } = info;
        const chunks: Buffer[] = [];

        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', async () => {
          try {
            const fileBuffer = Buffer.concat(chunks);
            const s3Key = `productdocs/${productId}_${Date.now()}_${filename}`;
            const uploadedUrl = await uploadFileToS3(fileBuffer, s3Key, mimeType);

            fileUrl = uploadedUrl;
            fileName = filename;
            resolveFile();
          } catch (err) {
            console.error('S3 upload error:', err);
            parseError = 'Error uploading to S3';
            rejectFile(err);
          }
        });

        file.on('error', (err) => {
          parseError = 'File stream error';
          rejectFile(err);
        });
      });

      filePromises.push(filePromise);
    });

    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'category') {
        fileCategory = val;
      }
    });

    busboy.on('finish', () => {
      Promise.all(filePromises)
        .then(() => (parseError ? reject(parseError) : resolve()))
        .catch((err) => {
          parseError = err.message || 'File upload error';
          reject(err);
        });
    });

    busboy.on('error', (err) => {
      console.error('Busboy error:', err);
      parseError = 'Error parsing form';
      reject(err);
    });

    const reader = request.body?.getReader();
    if (!reader) {
      parseError = 'No file stream found in request';
      reject(parseError);
      return;
    }

    (async () => {
      let done = false;
      while (!done) {
        const { done: doneReading, value } = await reader.read();
        if (doneReading) {
          busboy.end();
          done = true;
        } else if (value) {
          busboy.write(value);
        }
      }
    })();
  });

  // 4) If any parse/upload error
  if (parseError) {
    return NextResponse.json({ message: parseError }, { status: 500 });
  }
  if (!fileUrl) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  // 5) Insert doc into product, save
  product.uploadedDocuments.push({
    url: fileUrl,
    name: fileName,
    category: fileCategory,
    verified: false,
    rejectionReason: '',
    uploadedAt: new Date(),
  });
  await product.save();

  // 6) Retrieve the newly created subdoc
  // It's the last item in the array
  const createdDoc = product.uploadedDocuments[product.uploadedDocuments.length - 1];

  // Convert subdoc to an object so we can transform _id => string
  const createdDocObj = createdDoc.toObject();
  // If your subdoc has an auto _id, convert it to string:
  if (createdDocObj._id) {
    createdDocObj._id = createdDocObj._id.toString();
  }

  // 7) Return the doc with _id
  return NextResponse.json(createdDocObj, { status: 200 });
}
