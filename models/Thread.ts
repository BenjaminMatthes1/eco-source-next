// models/Thread.ts
// models/Thread.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IThread extends Document {
  title: string;
  author: mongoose.Types.ObjectId;
  content: string;
  tags?: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema: Schema<IThread> = new Schema(
  {
    title: { type: String, required: true },
    author: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ThreadSchema.index({ title: 'text', content: 'text' });
ThreadSchema.index({ tags: 1 });
ThreadSchema.index({ author: 1, createdAt: -1 });

const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema);

export default Thread;
