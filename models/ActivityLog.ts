// models/ActivityLog.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details?: any;
  createdAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed }, // Use Mixed type for flexible data
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
