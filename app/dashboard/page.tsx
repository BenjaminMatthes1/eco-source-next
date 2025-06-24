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
import ERSMetricsSummary from '@/components/dashboard/ERSMetricsSummary'; 
import Loading from '@/components/ui/Loading'

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
  return <Loading />;
}

  if (timedOut) {
    return <p>Not authenticated. Redirecting to signup...</p>;
  }

if (status === 'unauthenticated') {
  return (
    <div className="flex justify-center pt-10">
      <Loading size={48} />
    </div>
  );
}

  const user = session?.user;

  return (
    <div className="p-6">
      {/* avatar  greeting */}
      <div className="flex items-center gap-4 mb-8">
        {user?.profilePictureUrl && (
          <img
            src={user.profilePictureUrl}
            alt={user.name || 'avatar'}
            className="w-16 h-16 rounded-full object-cover border shadow"
          />
        )}
        <h1 className="text-4xl font-bold text-primary">
          Welcome, {user?.name ?? 'User'}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {user && (
          <AccountDetails
            user={{
              email: user.email ?? undefined,      // ← strips null
              role:  user.role,
              subscriptionStatus: user.subscriptionStatus,
            }}
          />
        )}
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
