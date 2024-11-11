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
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      {/* Display other user information as needed */}
      <button onClick={() => signOut()} className="btn btn-secondary mt-4">
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;
