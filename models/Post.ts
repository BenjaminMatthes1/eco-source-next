// models/Post.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  threadId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId; // User ID
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema({
  threadId: { type: mongoose.Types.ObjectId, ref: 'Thread' },
  author: { type: mongoose.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
}, {
  timestamps: true,
});

PostSchema.index({ threadId: 1, createdAt: 1 });
PostSchema.index({ author: 1, createdAt: -1 });

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
