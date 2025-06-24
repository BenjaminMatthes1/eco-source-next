// --- lib/s3Upload.ts (replace all) ---
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from './s3';

/**
 * Default bucket (all “folder” keys live under here) and CloudFront URL.
 * • DEFAULT_BUCKET   → holds Product Service User* folders
 * • CLOUDFRONT_URL   → OAC distribution that fronts DEFAULT_BUCKET
 */
const DEFAULT_BUCKET   = process.env.AWS_S3_BUCKET_NAME!;
const CLOUDFRONT_URL   = process.env.CLOUDFRONT_URL!;   // e.g. https://d3abc123.cloudfront.net
const REGION           = process.env.AWS_REGION!;

/**
 * Upload any buffer to S3 and return a *public* URL.
 *
 * @param buffer      File contents
 * @param key         Object key (e.g. ProductPhotos/abc.jpg)
 * @param mime        Content-Type (image/jpeg, application/pdf, …)
 * @param bucketName  Optional override bucket (rare) – direct S3 URL is returned
 */
export async function uploadFileToS3(
  buffer: Buffer,
  key: string,
  mime: string,
  bucketName?: string
): Promise<string> {
  const Bucket = bucketName ?? DEFAULT_BUCKET;

  await s3Client.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: buffer,
      ContentType: mime,
      ACL: 'private',                              // CloudFront OAC reads it
    })
  );

  // • When using the default bucket → serve through CloudFront
  // • When using an override bucket → give raw S3 URL
  return Bucket === DEFAULT_BUCKET && CLOUDFRONT_URL
    ? `${CLOUDFRONT_URL}/${key}`
    : `https://${Bucket}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Delete an object from S3 (used when a user removes an uploaded file).
 */
export async function deleteFileFromS3(key: string, bucketName?: string) {
  const Bucket = bucketName ?? DEFAULT_BUCKET;
  await s3Client.send(new DeleteObjectCommand({ Bucket, Key: key }));
}
