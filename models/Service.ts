import mongoose, { Schema, Document } from 'mongoose';

interface UploadedDocument {
  _id: string;
  url: string;
  name: string;
  verified: boolean;
  category?: string;
  rejectionReason?: string;
  uploadedAt?: Date;
}

interface Review {
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
}
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name?: string;
  profilePictureUrl?: string;
  // add more if needed
}

export interface IPhoto {
  _id: mongoose.Types.ObjectId;  // or string if you usually cast it
  url: string;
  key: string;
  name?: string;
  uploadedAt?: Date;
}

const RatingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 10, required: true },
  },
  { _id: false }
);

interface IPeerRatings {
  costEffectiveness: {
    userId: mongoose.Types.ObjectId;
    rating: number;
  }[];
  economicViability: {
    userId: mongoose.Types.ObjectId;
    rating: number;
  }[];
}

/**
 * IService (Mongoose Document)
 * Represents a service offered by a user/company.
 */
export interface IService extends Document {
  userId: mongoose.Types.ObjectId | PopulatedUser; // Reference to the User model
  name: string;
  description: string;
  categories: string[];     // e.g., "Consulting", "Transportation", "Waste Management"
  reviews: Review[];
  price: number;
  
  /* Old ers metrics
  materials?: {
    name: string;
    percentageRenewable: number;
  }[];
  energyUsage?: {
    value?: number;
    unit?: string; // "kWh", "MJ", or "N/A"
  };
  waterUsage?: {
    value?: number;
    unit?: string; // "liters", "gallons", or "N/A"
  };
  recyclable: boolean; // If the service deals with recyclables or fosters recycling
  serviceCost?: number;        // Base cost of the service
  carbonEmissions?: number;    // In kg CO2 or similar measure
  costEffectiveness?: number;  // 0–10 rating
  ethicalPractices?: string[]; // array of chosen practices
  */
  chosenMetrics: string[];
  metrics: Map<string, any>;

  uploadedDocuments: UploadedDocument[];
  isVerified: boolean;
  verificationPending: boolean;
  photos: IPhoto[];
  // Peer rating subdocs
  peerRatings: IPeerRatings;
}

const ServiceSchema = new Schema<IService>(
  {
    // The user that owns or provides this service
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviews: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: { type: Number, default: 0 },
        comment: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    name: { type: String, required: true },
    description: { type: String, required: true },
    categories: [{ type: String, default: [] }],
    price: { type: Number, required: true },

    /* old ers metrics
    materials: [
      {
        name: { type: String, required: true },
        percentageRenewable: { type: Number, required: true },
      },
    ],
    energyUsage: {
      value: { type: Number, required: false },
      unit: { type: String, required: false, default: 'N/A' },
    },
    waterUsage: {
      value: { type: Number, required: false },
      unit: { type: String, required: false, default: 'N/A' },
    },
    recyclable: { type: Boolean, default: false },
    serviceCost: { type: Number, required: false },
    carbonEmissions: { type: Number, required: false },
    costEffectiveness: {
      type: Number,
      min: 0,
      max: 10,
      required: false,
    },
    ethicalPractices: [{ type: String }],
    */
    chosenMetrics: {
      type: [String],
      default: [],
    },
    metrics: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    peerRatings: {
      costEffectiveness: [RatingSchema],
      economicViability: [RatingSchema],
    },
    



    uploadedDocuments: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true},
        url: { type: String, required: true },
        name: { type: String, required: true },
        verified: { type: Boolean, default: false },
        rejectionReason: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    photos: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        url: { type: String, required: true },
        key: { type: String, required: true },
        name: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    isVerified: { type: Boolean, default: false },
    verificationPending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Service ||
  mongoose.model<IService>('Service', ServiceSchema);
