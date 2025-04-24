// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Setting up the NextAuth handler with options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };