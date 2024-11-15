// models/Profile.ts
import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';

export interface IProfile {
  userId: mongoose.Types.ObjectId;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  socialMediaLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  badges?: string[];
  projects?: string[];
  joinDate: Date;
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      [key: string]: boolean | undefined;
    };
    timeZone?: string;
  };
}

export type ProfileDocument = HydratedDocument<IProfile>;

const ProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    bio: { type: String },
    avatarUrl: { type: String },
    skills: { type: [String], default: [] },
    socialMediaLinks: {
      type: Map,
      of: String,
      default: {},
    },
    badges: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    joinDate: { type: Date, default: Date.now },
    preferences: {
      notifications: {
        type: Map,
        of: Boolean,
        default: {
          email: true,
          sms: false,
          push: true,
        },
      },
      timeZone: { type: String, default: 'UTC' },
    },
  },
  {
    timestamps: true,
  }
);

const Profile: Model<ProfileDocument> =
  mongoose.models.Profile || mongoose.model<ProfileDocument>('Profile', ProfileSchema);

export default Profile;
