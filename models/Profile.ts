// models/Profile.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  socialMediaLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    [key: string]: string | undefined; // For any additional platforms
  };
  badges?: string[]; // Or a more complex structure if needed
  projects?: string[]; // Or references to project documents
  joinDate: Date;
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      [key: string]: boolean | undefined;
    };
    timeZone?: string;
    // ... other preference fields
  };
  // ... other profile-related fields
}

const ProfileSchema: Schema<IProfile> = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User', unique: true },
    bio: { type: String },
    avatarUrl: { type: String },
    skills: [{ type: String }],
    socialMediaLinks: {
      twitter: { type: String },
      linkedin: { type: String },
      facebook: { type: String },
      instagram: { type: String },
      // Additional platforms can be added as needed
    },
    badges: [{ type: String }],
    projects: [{ type: String }],
    joinDate: { type: Date, default: Date.now },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        // ... other notification types
      },
      timeZone: { type: String, default: 'UTC' },
      // ... other preferences
    },
    // ... other fields
  },
  {
    timestamps: true,
  }
);

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;
