// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    subscriptionStatus?: string;
  }

  interface Session {
    user: User;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

