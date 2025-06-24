// models/Post.ts
import mongoose, { Schema, Document, Model } from 'mongoose';



export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  title: string; 
  content: string; 
  threadId?: mongoose.Types.ObjectId; // Optional for thread-related posts
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  tags: string[];
  photos?: {
   _id:   mongoose.Types.ObjectId;   // auto-id for each sub-doc
   url:   string;                    // CloudFront URL
   key:   string;                    // S3 key (for future deletes)
   name?: string;
   uploadedAt?: Date;
 }[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true }, 
    content: { type: String, required: true },
    threadId: { type: Schema.Types.ObjectId, ref: 'Thread' }, // Optional
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tags: { type: [String], default: [] },
    photos: [
      {
        _id:        { type: Schema.Types.ObjectId, auto: true },
        url:        { type: String, required: true },
        key:        { type: String, required: true },
        name:       { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/* text index: title (weight 3) outranks content (weight 1) */
PostSchema.index(
  { title: 'text', content: 'text' },
  { weights: { title: 3, content: 1 } }
);

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;