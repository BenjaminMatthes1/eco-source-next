// services/activityLogService.ts
import ActivityLog from '@/models/ActivityLog';

export async function getActivityLogs(userId: string) {
  // Fetch the user's activity logs from the database
  return await ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(10);
}
