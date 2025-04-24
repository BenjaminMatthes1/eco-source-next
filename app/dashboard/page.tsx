'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AccountDetails from '@/components/dashboard/AccountDetails';
import RecentActivity from '@/components/dashboard/RecentActivity';
import UserActions from '@/components/dashboard/UserActions';
import Notifications from '@/components/dashboard/Notifications';
import MessagesPreview from '@/components/dashboard/MessagesPreview';
import DashboardProducts from '@/components/dashboard/DashboardProducts';
import DashboardServices from '@/components/dashboard/DashboardServices';
import ERSMetricsSummary from '@/components/dashboard/ERSMetricsSummary'; // Import the new component

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout for unauthenticated users
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (status === 'unauthenticated') {
        setTimedOut(true);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [status]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (timedOut) {
      const redirectTimer = setTimeout(() => {
        router.push('/signup');
      }, 2000);
      return () => clearTimeout(redirectTimer);
    }
  }, [timedOut, router]);

  if (status === 'loading' && !timedOut) {
    return <p>Loading session...</p>;
  }

  if (timedOut) {
    return <p>Not authenticated. Redirecting to signup...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>Loading session...</p>;
  }

  const user = session?.user;

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8 text-primary">
        Welcome, {user?.name ?? 'User'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <AccountDetails user={user} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <RecentActivity userId={user?.id} />
        <UserActions />
        <Notifications userId={user?.id} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-0">
        <MessagesPreview userId={user?.id} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DashboardProducts userId={user?.id || ''} />
        <DashboardServices userId={user?.id || ''} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
        <ERSMetricsSummary userId={user?.id || ''} /> {/* Add ERS Metrics Summary */}
      </div>
    </div>
  );
}
