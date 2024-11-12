// pages/api/users/[userId]/preferences.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { userId } = req.query;

  // Ensure the user can only update their own preferences
  if (session.user.id !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.method === 'PUT') {
    const { preferences } = req.body;

    try {
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { $set: { preferences } },
        { new: true }
      ).exec();

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      return res.status(200).json({ profile });
    } catch (error) {
      console.error('Error updating preferences:', error);
      return res.status(500).json({ message: 'Error updating preferences' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
