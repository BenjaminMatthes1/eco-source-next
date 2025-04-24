'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import NewProductForm from '@/components/forms/products/NewProductForm';

const NewProductPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p className="m-6">Loading…</p>;
  }

  const currentUserId = session?.user?.id ?? '';

  return (
    <div className="w-full p-0 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-primary text-center px-5 py-5">
        List a New Product
      </h1>

      {/* pass required prop */}
      <NewProductForm currentUserId={currentUserId} />
    </div>
  );
};

export default NewProductPage;