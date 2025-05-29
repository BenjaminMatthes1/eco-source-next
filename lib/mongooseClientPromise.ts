// lib/mongooseClientPromise.ts
import mongoose from 'mongoose';
import User    from '@/models/User';
import Product from '@/models/Product';
import Service from '@/models/Service';

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');

declare global {
  // allow global cache in TS
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export default async function connectToDatabase() {
  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 3000,
    });

    /* once connected the first time, sync indexes for key models */
    global._mongoosePromise.then(async () => {
      console.log('✅  Mongoose connected');
      try {
        await Promise.all([
          User.syncIndexes(),
          Product.syncIndexes(),
          Service.syncIndexes(),
        ]);
        console.log('🔄  Indexes synced');
      } catch (err) {
        console.warn('⚠️  Index sync failed:', err);
      }
    });
  }
  return global._mongoosePromise;
}
