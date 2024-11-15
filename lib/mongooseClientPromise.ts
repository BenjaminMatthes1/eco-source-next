import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongooseClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongooseClientPromise) {
  client = new MongoClient(uri, options);
  global._mongooseClientPromise = client.connect();
}
clientPromise = global._mongooseClientPromise;

export default clientPromise;
