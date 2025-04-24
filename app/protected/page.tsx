// app/protected/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  
  if (!session) {
    redirect('/login');
    return null; // Prevents rendering before redirection
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <div className="max-w-lg w-full p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-primary mb-4">Protected Page</h1>
        <p className="text-lg">Welcome, {session.user.name}!</p>
        <p className="mt-4">This is a protected area accessible only to authenticated users.</p>
      </div>
    </div>
  );
}
