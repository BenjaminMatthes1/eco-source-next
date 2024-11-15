// models/ActivityLog.ts
import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';

export interface IActivityLog {
  userId: mongoose.Types.ObjectId;
  action: string;
  details?: any;
  createdAt?: Date; // Made optional
}

export type ActivityLogDocument = HydratedDocument<IActivityLog>;

const ActivityLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed }, // Use Mixed type for flexible data
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
