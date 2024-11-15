// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  password: string;
  image?: string;
  emailVerified?: Date;
  subscriptionStatus: 'free' | 'subscribed' | 'premium';
  role: string;
  interests: string[];
  location?: string;
  subscribeNewsletter: boolean;
  companyName?: string;
  website?: string;
  // profilePictureUrl?: string; // For storing profile picture URL
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Date },
    subscriptionStatus: { type: String, default: 'free' },
    role: { type: String, required: true },
    interests: { type: [String], default: [] },
    location: { type: String },
    subscribeNewsletter: { type: Boolean, default: false },
    companyName: { type: String },
    website: { type: String },
    // profilePictureUrl: { type: String }, // For storing profile picture URL
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
