// models/Message.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;  // User ID
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
  conversationId: { type: mongoose.Types.ObjectId, ref: 'Conversation' },
  sender: { type: mongoose.Types.ObjectId, ref: 'User' },
  content: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
