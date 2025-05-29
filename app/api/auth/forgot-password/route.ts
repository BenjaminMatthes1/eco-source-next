import crypto from 'crypto';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email } = await request.json();

  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ ok: true }); // silence enumeration

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken = hashed;
  user.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000); // 1 h
  await user.save();

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset/${rawToken}`;
  await sendPasswordResetEmail(email, resetUrl);

  return NextResponse.json({ ok: true });
}
