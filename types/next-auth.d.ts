// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      // Add any other properties you need
    };
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    // Add any other properties you need
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    // Add any other properties you need
  }
}