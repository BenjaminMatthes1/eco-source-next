import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';

import mongoose from 'mongoose';
import Message  from '@/models/Message';
import User     from '@/models/User';

export async function GET(
  _req: NextRequest,
  ctx: { params: { userId: string } }
) {
  /* ---------- auth ---------- */
  const session = await getServerSession(authOptions);
  const { userId } = await ctx.params; 
  if (!session || session.user.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const currentUserId = session.user.id;

  /* ---------- db ---------- */
  await connectToDatabase();
  const myId = new mongoose.Types.ObjectId(currentUserId);

  /* ---------- aggregation: one doc per conversation ---------- */
  const threads = await Message.aggregate([
    /* only messages involving me */
    { $match: { $or: [{ senderId: myId }, { recipientId: myId }] } },

    /* newest message first */
    { $sort: { createdAt: -1 } },

    /* group by "the other participant" */
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', myId] },
            '$recipientId', // if I'm sender, other is recipient
            '$senderId',    // else I'm recipient
          ],
        },
        preview:   { $first: '$content' },
        timestamp: { $first: '$createdAt' },
      },
    },

    /* look up other user's name */
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },

    /* project final shape */
    {
      $project: {
        _id: 1,
        senderName: '$user.name',
        preview: 1,
        timestamp: 1,
      },
    },
    /* optional: sort by newest thread */
    { $sort: { timestamp: -1 } },
  ]);

  return NextResponse.json(threads, { status: 200 });
}
