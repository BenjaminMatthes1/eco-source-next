import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // or use getToken if you prefer
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Service from '@/models/Service';
import Busboy from 'busboy';
import { uploadFileToS3 } from '@/lib/s3Upload';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ serviceId: string }> }
) {
  // 1) Await serviceId from dynamic route
  const { serviceId } = await context.params;

  // 2) Auth check (optional)
  //    If you only want owners or admin to do this, you'd check user ID or role
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 3) Connect DB & find service
  await connectToDatabase();
  const service = await Service.findById(serviceId);
  if (!service) {
    return NextResponse.json({ message: 'Service not found' }, { status: 404 });
  }

  // 4) Prepare Busboy
  const contentType = request.headers.get('content-type') || '';
  const busboy = Busboy({ headers: { 'content-type': contentType } });

  let parseError = '';
  let fileCategory = '';

  let fileUrl = '';
  let fileName = '';
  const filePromises: Promise<void>[] = [];

  await new Promise<void>((resolve, reject) => {
    // File fields
    busboy.on('file', (fieldname, file, info) => {
      // Adjust if your front-end uses a different field name
      if (fieldname !== 'file') return;

      const filePromise = new Promise<void>((resolveFile, rejectFile) => {
        const { filename, mimeType } = info;
        const chunks: Buffer[] = [];

        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', async () => {
          try {
            const fileBuffer = Buffer.concat(chunks);
            // Construct S3 key
            const s3Key = `servicedocs/${serviceId}_${Date.now()}_${filename}`;
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
          console.error('File stream error:', err);
          parseError = 'File stream error';
          rejectFile(err);
        });
      });

      filePromises.push(filePromise);
    });

    // Field for category
    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'category') {
        fileCategory = val;
      }
    });

    busboy.on('finish', () => {
      // Wait for all uploads to finish
      Promise.all(filePromises)
        .then(() => {
          if (parseError) reject(parseError);
          else resolve();
        })
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

    // 5) Convert Next.js ReadableStream => Node stream
    const reader = request.body?.getReader();
    if (!reader) {
      parseError = 'No file stream found';
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

  // 6) Check for errors or missing file
  if (parseError) {
    return NextResponse.json({ message: parseError }, { status: 500 });
  }
  if (!fileUrl) {
    return NextResponse.json({ message: 'No file was uploaded' }, { status: 400 });
  }

  // 7) Insert doc into service
  service.uploadedDocuments.push({
    url: fileUrl,
    name: fileName,
    category: fileCategory,
    verified: false,
    rejectionReason: '',
    uploadedAt: new Date(),
  });

  await service.save();

  // 8) Retrieve the newly created doc subdocument
  // It's the last item in the array
  const createdDoc = service.uploadedDocuments[service.uploadedDocuments.length - 1];

  // Convert subdoc to plain object so we can turn ObjectId => string
  const docObj = createdDoc.toObject();
  if (docObj._id) {
    docObj._id = docObj._id.toString();
  }

  // 9) Return the doc with _id
  return NextResponse.json(docObj, { status: 200 });
}
