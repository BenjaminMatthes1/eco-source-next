// pages/api/users/[userId]/activity-logs.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const session = await getSession({ req });
  const { userId } = req.query;
  const { page = 1, limit = 20 } = req.query;

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Only allow the user or an admin to access the logs
  if (session.user.id !== userId /* && !session.user.isAdmin */) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      const logs = await ActivityLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .exec();

      return res.status(200).json({ logs });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return res.status(500).json({ message: 'Error fetching activity logs' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
