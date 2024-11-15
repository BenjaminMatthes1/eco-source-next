// models/Post.ts
import mongoose, { Schema, Document, Model, HydratedDocument } from 'mongoose';

export interface IPost {
  threadId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId; // User ID
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PostDocument = HydratedDocument<IPost>;

const PostSchema: Schema<IPost> = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ threadId: 1, createdAt: 1 });
PostSchema.index({ author: 1, createdAt: -1 });

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
