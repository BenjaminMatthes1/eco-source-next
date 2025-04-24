// models/Thread.ts
import mongoose, { Schema, Model } from 'mongoose';

export interface IThread {
  title: string;
  author: mongoose.Types.ObjectId;
  content: string;
  tags?: string[];
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ThreadSchema = new Schema<IThread>(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
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

