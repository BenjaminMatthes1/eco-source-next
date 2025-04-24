// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongooseClientPromise';
import User, { IUser } from '@/models/User';


export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      name,
      role,
      interests,
      location,
      subscribeNewsletter,
      companyName,
      website,
    } = await request.json();

    // Ensure required fields are present
    if (!email || !password || !name || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 422 });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user instance
    const user: IUser = new User({
      email,
      password: hashedPassword,
      name,
      role,
      interests,
      location,
      subscribeNewsletter,
      companyName,
      website,
    });

    await user.save();

 

    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}
