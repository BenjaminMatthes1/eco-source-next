// app/api/users/[userId]/avatar/route.ts
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
  const { userId } = await context.params;

  // 1) Auth
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.id !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // 2) Connect to DB, find user
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

const contentType = request.headers.get('content-type') || '';

  /* ── JSON body branch  (new) ─────────────────────────── */
  if (contentType.includes('application/json')) {
    try {
      const { url } = await request.json();
      if (!url)
        return NextResponse.json(
          { message: 'url required' },
          { status: 400 }
        );

      user.profilePictureUrl = url;
      await user.save();

      return NextResponse.json(
        { message: 'Profile picture updated', url },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        { message: 'Invalid JSON body' },
        { status: 400 }
      );
    }
  }

  /* ── Multipart branch (existing) ────────────────────── */
  const busboy = Busboy({ headers: { 'content-type': contentType } });

  // We track all file uploads in an array of promises
  const uploadPromises: Promise<void>[] = [];
  let parseError = '';

  // 3) Busboy file event
  busboy.on('file', (fieldname, file, info) => {
    console.log('Busboy "file" event -> fieldname:', fieldname);
    if (fieldname !== 'file') {
      // If you only expect 'file', ignore other fields or handle them accordingly
      console.log(`Ignoring field "${fieldname}"`);
    }

    const { filename, mimeType } = info;
    const chunks: Buffer[] = [];

    file.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // We'll create a promise for each file, resolving/rejecting when file ends
    const uploadPromise = new Promise<void>((resolve, reject) => {
      file.on('end', async () => {
        try {
          const fileBuffer = Buffer.concat(chunks);
          const s3Key = `avatars/${userId}_${Date.now()}_${filename}`;

          // Upload to S3
          const uploadedUrl = await uploadFileToS3(fileBuffer, s3Key, mimeType);
          console.log('S3 uploadedUrl:', uploadedUrl);

          // Overwrite the user's profilePictureUrl right here
          // If multiple files are uploaded, you'd have to decide how to handle them.
          user.profilePictureUrl = uploadedUrl;

          resolve(); // Done for this file
        } catch (err) {
          console.error('S3 upload error:', err);
          parseError = 'Error uploading to S3';
          reject(err);
        }
      });
    });

    // Push this file's promise into the array
    uploadPromises.push(uploadPromise);
  });

  // 4) Busboy finish event
  busboy.on('finish', async () => {
    console.log('Busboy finished. parseError=', parseError);

    if (parseError) {
      // If we had an upload error, reject the main promise
      return mainReject(parseError);
    }

    // Otherwise, wait for all file uploads to complete
    try {
      await Promise.all(uploadPromises);
      mainResolve();
    } catch (err) {
      console.error('One of the uploads failed:', err);
      parseError = 'Upload failed';
      mainReject(parseError);
    }
  });

  // 5) Busboy error
  busboy.on('error', (err) => {
    console.error('Busboy error:', err);
    parseError = 'Error parsing form';
    mainReject(err);
  });

  // 6) Convert the busboy flow to a Promise, so we can await
  let mainResolve: () => void;
  let mainReject: (reason?: any) => void;

  await new Promise<void>((resolve, reject) => {
    mainResolve = resolve;
    mainReject = reject;

    // Read the request body into busboy
    const reader = request.body?.getReader();
    if (!reader) {
      parseError = 'No file stream found in request body';
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

  if (parseError) {
    return NextResponse.json({ message: parseError }, { status: 500 });
  }

  // If no files were appended => no user.profilePictureUrl updated
  if (!user.profilePictureUrl) {
    return NextResponse.json({ message: 'No file was uploaded' }, { status: 400 });
  }

  // 7) Save user with updated profilePictureUrl
  await user.save();

  return NextResponse.json(
    { message: 'Profile picture updated', url: user.profilePictureUrl },
    { status: 200 }
  );
}
