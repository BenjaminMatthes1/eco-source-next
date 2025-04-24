// types/next-auth.d.ts
import NextAuth from 'next-auth';
import type { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    subscriptionStatus?: string | null;
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

declare module 'next' {
  interface NextApiRequest {
    user?: DefaultUser & { role?: string }; // Include custom fields like `role`
  }
}