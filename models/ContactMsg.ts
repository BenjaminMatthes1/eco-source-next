import { Schema, model, models } from 'mongoose';
export default models.ContactMsg ||
  model('ContactMsg', new Schema(
    { name: String, email: String, message: String, resolved: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now } }
  ));
