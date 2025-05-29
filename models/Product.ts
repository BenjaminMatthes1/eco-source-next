import mongoose, { Schema, Document } from 'mongoose';

interface UploadedDocument {
  _id: string;
  url: string;
  name: string;
  verified: boolean;
  category: string;
  rejectionReason?: string;
  uploadedAt: Date;
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
  { _id: false } // don't generate a separate _id for each rating
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
 * Mongoose Document interface
 */
export interface IProduct extends Document {
  userId: mongoose.Types.ObjectId | PopulatedUser; // Reference to the User model
  name: string;
  description: string;
  price: number;
  reviews: Review[];
  categories: string[];

  uploadedDocuments: UploadedDocument[];
  isVerified: boolean;
  verificationPending: boolean;


  photos: IPhoto[];
  chosenMetrics: string[];
  metrics: Map<string, any>;
  peerRatings: IPeerRatings;

}



const ProductSchema = new Schema<IProduct>(
  {
    /**
     * userId references the User model, ensuring we know who created/owns this product
     */
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
    price: { type: Number, required: true },
    categories: [{ type: String, default: [] }],



    uploadedDocuments: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
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
        key: { type: String, required: true },  // store S3 key
        name: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    isVerified: { type: Boolean, default: false },
    verificationPending: { type: Boolean, default: false },

    chosenMetrics: {
      type: [String],
      default: [],
    },
    metrics: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    peerRatings: {
      costEffectiveness: [RatingSchema],
      economicViability: [RatingSchema],
    },
    
  },

  

  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });
export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);
