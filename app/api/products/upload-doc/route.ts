import { NextRequest, NextResponse } from 'next/server';
import Busboy from 'busboy';
import { uploadFileToS3 } from '@/lib/s3Upload';

/**
 * We'll store the doc in S3 under "productdocs".
 * We then return JSON with the doc info so the client can add it
 * to their formData.uploadedDocuments array.
 *
 * If you later want to tie directly to a product ID, you'd do
 * a param-based route, e.g. /api/products/[productId]/upload-doc. 
 */
export async function POST(request: NextRequest) {
  // We'll parse multipart/form-data using Busboy
  const contentType = request.headers.get('content-type') || '';
  const busboy = Busboy({ headers: { 'content-type': contentType } });

  // We need to store the results somewhere:
  let fileUrl = '';
  let fileName = '';
  let fileCategory = '';
  let parseError = '';

  // We'll wrap busboy in a promise to await it finishing
  const result = await new Promise<void>((resolve, reject) => {
    busboy.on('file', async (fieldname, file, info) => {
      // fieldname should be "file"
      // info has { filename, encoding, mimeType }
      const { filename, mimeType } = info;
      const chunks: Buffer[] = [];

      file.on('data', (chunk) => {
        chunks.push(chunk);
      });

      file.on('end', async () => {
        try {
          // 1) Combine chunks
          const fileBuffer = Buffer.concat(chunks);
          // 2) Construct an S3 key under "productdocs/"
          const s3Key = `productdocs/${Date.now()}_${filename}`;
          // 3) Upload to S3
          const uploadedUrl = await uploadFileToS3(fileBuffer, s3Key, mimeType);

          fileUrl = uploadedUrl;
          fileName = filename;
        } catch (err) {
          console.error('S3 upload error:', err);
          parseError = 'Error uploading to S3';
        }
      });
    });

    // We also want to parse a "category" field from formData
    busboy.on('field', (fieldname, val) => {
      // e.g. fieldname might be "category"
      if (fieldname === 'category') {
        fileCategory = val;
      }
    });

    busboy.on('finish', () => {
      if (parseError) {
        reject(parseError);
      } else {
        resolve();
      }
    });

    busboy.on('error', (err) => {
      console.error('Busboy error:', err);
      parseError = 'Error parsing form';
      reject(err);
    });

    // Convert NextRequest body (ReadableStream) => Node stream
    const reader = request.body?.getReader();
    if (!reader) {
      parseError = 'No request body stream found';
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

  // if parseError was set, return 500
  if (parseError) {
    return NextResponse.json({ message: parseError }, { status: 500 });
  }

  if (!fileUrl) {
    // No file was successfully uploaded
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }

  // Construct final doc object
  const docData = {
    url: fileUrl,
    name: fileName,          // original filename
    category: fileCategory,  
    verified: false,         // default
    rejectionReason: '',
    uploadedAt: new Date(),
  };

  return NextResponse.json(docData, { status: 200 });
}
