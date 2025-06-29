import { SESClient } from '@aws-sdk/client-ses';


const region = process.env.AWS_REGION;
if (!region) throw new Error('AWS_REGION env var not set');
export const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
