// models/Notification.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  message: string;
  read: boolean;
  timestamp: Date;
  link: string; 
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  link: { type: String, required: true },
});

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

