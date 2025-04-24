'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import NewServiceForm from '@/components/forms/services/NewServiceForm';

const NewServicePage = () => {
  const { data: session, status } = useSession();          // ← get session
  const userId = session?.user?.id ?? '';                  // safe fallback

  if (status === 'loading') {
    return <p className="m-6">Loading…</p>;
  }

  return (
    <div className="w-full p-0 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-primary text-center px-5 py-5">
        List a New Service
      </h1>

      {/* pass the prop that NewServiceForm expects */}
      <NewServiceForm currentUserId={userId} />
    </div>
  );
};

export default NewServicePage;