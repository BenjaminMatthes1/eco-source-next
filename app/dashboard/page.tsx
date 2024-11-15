// app/dashboard/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  const user = session?.user;

  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-8 text-primary">Welcome, {user?.name}</h1>
      <div className="bg-neutral rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
        <p className="text-lg mb-2"><strong>Email:</strong> {user?.email}</p>
        <p className="text-lg mb-2"><strong>Role:</strong> {user?.role}</p>
        <p className="text-lg"><strong>Subscription Status:</strong> {user?.subscriptionStatus || 'Free'}</p>
      </div>
      
      {/* Placeholder for potential user actions or additional features */}
      <div className="bg-neutral rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">Your Actions</h2>
        <p className="text-lg mb-4">Access your profile, update preferences, and explore other dashboard features.</p>
        <div className="flex space-x-4">
          <button className="btn btn-primary">Edit Profile</button>
          <button className="btn btn-secondary" onClick={() => signOut()}>Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
