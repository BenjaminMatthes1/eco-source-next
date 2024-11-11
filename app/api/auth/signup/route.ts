// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
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
    // profilePicture, // Handle file uploads separately
  } = await request.json();

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 422 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      interests,
      location,
      subscribeNewsletter,
      companyName,
      website,
      // profilePictureUrl: 'url-to-uploaded-picture', // Set after handling file upload
    });

    await user.save();
    if (!email || !password || !name || !role) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
      }

    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}
