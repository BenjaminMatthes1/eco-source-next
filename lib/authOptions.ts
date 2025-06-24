// --- lib/authOptions.ts (replace all) ---
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './mongodb';
import connectToDatabase from './mongooseClientPromise';
import User, { IUser } from '@/models/User';

const prod = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB || 'EcoSourceDB',
  }),

  cookies: {
    sessionToken: {
      name: prod ? '__Secure-eco-session' : 'eco-session',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: prod,
        path: '/',
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password)
          throw new Error('Email and password are required');

        await connectToDatabase();

        const user = (await User.findOne({ email: credentials.email })) as
          | IUser
          | null;
        if (!user) throw new Error('No user found with that email');

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) throw new Error('Incorrect password');

        /* shape that lands in `user` param of jwt() */
        return {
          id:   user._id.toString(),
          name: user.name || '',
          email: user.email,
          role:  user.role           || 'user',
          subscriptionStatus: user.subscriptionStatus || 'free',
          profilePictureUrl: user.profilePictureUrl   || undefined,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    /* ---------- JWT ---------- */
    async jwt({ token, user }) {
      /* first login: cache everything */
      if (user) {
        token.id                  = user.id;
        token.role                = (user as any).role;
        token.subscriptionStatus  = (user as any).subscriptionStatus;
        token.profilePictureUrl   = (user as any).profilePictureUrl ?? undefined;
        return token;
      }

      /* token refresh: pull missing fields once */
      if (token.id && (!token.subscriptionStatus || !token.profilePictureUrl)) {
        const dbUser = await User.findById(token.id).select(
          'role subscriptionStatus profilePictureUrl'
        );

        token.role               = dbUser?.role               ?? 'user';
        token.subscriptionStatus = dbUser?.subscriptionStatus ?? 'free';
        token.profilePictureUrl  = dbUser?.profilePictureUrl  ?? undefined;
      }

      return token;
    },

    /* ---------- Session ---------- */
    async session({ session, token }) {
      if (session.user) {
        session.user.id                 = token.id   as string;
        session.user.role               = token.role as string;
        session.user.subscriptionStatus =
          token.subscriptionStatus as 'free' | 'subscribed' | 'premium';
        session.user.profilePictureUrl  =
          token.profilePictureUrl as string | undefined;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
