// lib/s3Upload.ts
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from './s3';

export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileKey: string,
  mimeType: string
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('Missing AWS_S3_BUCKET_NAME in environment');
  }

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL: 'public-read', // if your bucket policy or ACL requires it
  });
  await s3Client.send(putCommand);

  // Return a public URL (assuming your bucket is public or using a policy)
  return `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
}

export async function deleteFileFromS3(fileKey: string): Promise<void> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('Missing AWS_S3_BUCKET_NAME in environment');
  }

  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });
  await s3Client.send(deleteCommand);

  // No return if successful. If there's an error, an exception is thrown.
  console.log(`File with key "${fileKey}" deleted from S3`);
}
