// lib/mongooseClientPromise.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
  // allow global cache in TS
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export default async function connectToDatabase() {
  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(MONGODB_URI, {
      // any mongoose options you need
      bufferCommands: false,
    });
    // optional: log once
    global._mongoosePromise.then(() => console.log('✅  Mongoose connected'));
  }
  return global._mongoosePromise;
}
