import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './mongooseClientPromise';
import connectToDatabase from './mongodb';
import User, { IUser } from '@/models/User';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email }) as IUser | null;
        if (!user) {
          throw new Error('No user found with the given email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        return {
          id: user._id.toString(),
          name: user.name || '',
          email: user.email,
          role: user.role || 'user',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || '';
        token.role = user.role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string) || '';
        session.user.role = (token.role as string) || 'user';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
