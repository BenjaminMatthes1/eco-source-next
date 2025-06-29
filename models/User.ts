import mongoose, { Schema, Document, Model } from 'mongoose';

interface UploadedDocument {
  url: string;
  name: string;
  verified: boolean;
  category?: string;
  uploadedAt: Date;
  rejectionReason?: string;
}

/**
 * Updated user-level ERS metrics structure
 */
interface IUserERSMetrics {
  economicImpactRating: number;       // 0–10
  additionalEthicalPractices: string[]; // e.g. ["Pays Living Wage", "Circular Economy"]
  carbonFootprint: number;           // e.g. metric tons CO2
  carbonOffsets: number;             // e.g. metric tons offset
  hasSustainabilityPolicy: boolean;
  charitableDonationsPercent: number; // 0–100
  hasVolunteerPrograms: boolean;
  overallScore: number;              // final user-level ERS out of 100
}

export interface IUserPreferences {
  newsletter: boolean;         // marketing emails
  allowMessages: boolean;      // can anyone DM this user?
  showPublicScore: boolean;    // display ERS score on profile
  preferredUnits: 'metric' | 'imperial';
  preferredMarkets: string[];  // e.g. ['EU', 'North America']
  linkedin?: string;
  website?: string;
}

/**
 * IUser Document
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  bio?: string;
  email: string;
  password: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  profilePictureUrl?: string;
  emailVerified?: Date;
  subscriptionStatus: 'free' | 'subscribed' | 'premium';
  role: string;
  interests: string[];
  location?: string;
  subscribeNewsletter: boolean;
  companyName?: string;
  website?: string;
  preferences: IUserPreferences;
  uploadedDocuments: UploadedDocument[];
  isVerified: boolean;
  verificationPending: boolean;
  businessSize?: 'micro' | 'small' | 'medium' | 'large';

  // references to products, services, posts, etc.
  product: mongoose.Types.ObjectId[];
  service: mongoose.Types.ObjectId[];
  Post: mongoose.Types.ObjectId[];


  chosenMetrics: string[];
  metrics: Map<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ─── embedded prefs schema ─────────────────────────── */
const PreferencesSchema = new Schema(
  {
    newsletter:      { type: Boolean, default: false },
    allowMessages:   { type: Boolean, default: true },
    showPublicScore: { type: Boolean, default: true },
    preferredUnits:  { type: String,  enum: ['metric', 'imperial'], default: 'metric' },
    preferredMarkets:{ type: [String], default: [] },   // ISO region tags, free text, etc.
    linkedin:        { type: String, default: '' },
    website:         { type: String, default: '' },
  },
  { _id: false }   // embed, no separate _id
);

/**
 * Mongoose schema
 */
const UserSchema: Schema<IUser> = new Schema(
  {
    name:  { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    bio: { type: String },
    profilePictureUrl: { type: String },
    emailVerified: { type: Date },
    subscriptionStatus: { type: String, default: 'free' },
    role: { type: String, required: true },
    interests: { type: [String], default: [] },
    location: { type: String },
    subscribeNewsletter: { type: Boolean, default: false },
    companyName: { type: String },
    website: { type: String },
    preferences: { type: PreferencesSchema, default: () => ({}) },
    businessSize: {
     type: String,
     enum: ['micro', 'small', 'medium', 'large'],
     default: 'small',
    },


    chosenMetrics: {
      type: [String],
      default: [],
    },
    metrics: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },


    uploadedDocuments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String }, // e.g. "Certification", "PolicyDoc"
        verified: { type: Boolean, default: false },
        rejectionReason: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    isVerified: { type: Boolean, default: false },
    verificationPending: { type: Boolean, default: false },

    product: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    service: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    Post: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);



const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
