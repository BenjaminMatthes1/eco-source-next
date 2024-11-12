// models/Conversation.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // Array of User IDs
  lastMessage?: mongoose.Types.ObjectId;   // Reference to the last message
  updatedAt: Date;
}

const ConversationSchema: Schema<IConversation> = new Schema({
  participants: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Types.ObjectId, ref: 'Message' },
}, {
  timestamps: true,
});

ConversationSchema.index({ participants: 1 });

const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
