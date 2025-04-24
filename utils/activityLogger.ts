// utils/activityLogger.ts
import ActivityLog, { IActivityLog } from '@/models/ActivityLog';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongooseClientPromise';

/**
 * Logs user activity.
 * @param userId - The ID of the user performing the action.
 * @param action - A description of the action performed.
 * @param details - Additional details about the action.
 */
export async function logActivity(
  userId: mongoose.Types.ObjectId,
  action: string,
  details?: any
): Promise<IActivityLog | null> {
  try {
    await connectToDatabase();

    const logEntry = new ActivityLog({
      userId,
      action,
      details,
    });

    await logEntry.save();

    return logEntry;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
}
