// app/api/auth/reset-password/route.ts
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  await connectToDatabase();
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user)
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return NextResponse.json({ ok: true });
}
