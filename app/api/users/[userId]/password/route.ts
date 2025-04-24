import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

function validateNewPassword(password: string): { isValid: boolean; message: string } {
  // Example rules:
  // - min 8 chars
  // - at least 1 uppercase
  // - at least 1 lowercase
  // - at least 1 number
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one digit.' };
  }
  return { isValid: true, message: 'OK' };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // 1) Check session
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;
  // Only user themselves or admin can change password
  if (session.user.id !== userId && session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // 2) Parse body
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Missing currentPassword or newPassword' }, { status: 400 });
    }

    // 3) Connect DB
    await connectToDatabase();

    // 4) Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 5) Check currentPassword
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    // 6) Validate newPassword
    const { isValid, message } = validateNewPassword(newPassword);
    if (!isValid) {
      return NextResponse.json({ message }, { status: 400 });
    }

    // 7) Hash and save new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error updating password:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
