import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';

import Busboy from 'busboy';
import { uploadFileToS3 } from '@/lib/s3Upload';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  // 1) await the dynamic param
  const { userId } = await context.params;

  // 2) Auth check
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  // If you want to ensure the user can only upload their own docs (or an admin can):
  // if (session.user.id !== userId && session.user.role !== 'admin') {
  //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  // }

  // 3) Connect DB & find user
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // 4) Prepare Busboy
  const contentType = request.headers.get('content-type') || '';
  const busboy = Busboy({ headers: { 'content-type': contentType } });

  let fileUrl = '';
  let fileName = '';
  let fileCategory = '';
  let parseError = '';

  // 5) Parse the multipart form
    // 1) Collect S3-upload promises in an array
    const uploadPromises: Promise<void>[] = [];

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
  
      // Create a promise that handles the entire file upload
      const uploadPromise = new Promise<void>((resolve, reject) => {
        const chunks: Buffer[] = [];
  
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });
  
        file.on('end', async () => {
          try {
            const fileBuffer = Buffer.concat(chunks);
            const s3Key = `userdocs/${userId}_${Date.now()}_${filename}`;
  
            const uploadedUrl = await uploadFileToS3(fileBuffer, s3Key, mimeType);
            fileUrl = uploadedUrl;
            fileName = filename;
            resolve(); // done uploading
          } catch (err) {
            console.error('S3 upload error:', err);
            parseError = 'Error uploading to S3';
            reject(err);
          }
        });
      });
  
      // push the promise into the array
      uploadPromises.push(uploadPromise);
    });
  
    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'category') {
        fileCategory = val;
      }
    });
  
    // 2) When Busboy says "finish," that just means it read all form data
    // but not necessarily that each async upload is done.
    // So we must wait for the upload promises to finish.
    const busboyFinished = new Promise<void>((resolve, reject) => {
      busboy.on('finish', () => {
        if (parseError) {
          reject(parseError);
        } else {
          resolve();
        }
      });
      busboy.on('error', reject);
    });
  
    // 3) Start piping the request body into busboy
    const reader = request.body?.getReader();
    if (!reader) {
      return NextResponse.json({ message: 'No file stream found in request body' }, { status: 400 });
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
  
    // 4) Wait for busboy to finish reading AND for all uploads to complete
    try {
      await busboyFinished;
      await Promise.all(uploadPromises);
    } catch (err) {
      console.error('Parse/Upload error:', err);
      return NextResponse.json({ message: parseError || 'Error parsing form' }, { status: 500 });
    }
  
    // 5) Finally check if we got a file
    if (!fileUrl) {
      return NextResponse.json({ message: 'No file was uploaded' }, { status: 400 });
    }
  
    // 6) Save doc object on user
    const newDoc = {
      url: fileUrl,
      name: fileName,
      category: fileCategory,
      verified: false,
      rejectionReason: '',
      uploadedAt: new Date(),
    };
    user.uploadedDocuments.push(newDoc as any);
    await user.save();
  
    return NextResponse.json(newDoc, { status: 200 });
  }
  
