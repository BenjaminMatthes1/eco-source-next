// app/dashboard/explore/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductsList from '@/components/explore/ProductsList';
import ServicesList from '@/components/explore/ServicesList';
import UsersList from '@/components/explore/UsersList';

const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'users'>('products');
  const router = useRouter();

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-4">Explore</h1>

      {/* Add Product/Service Buttons */}
      <div className="flex justify-between gap-4 mb-6">
        <button
          onClick={() => router.push('/products/new')}
          className="btn btn-primary"
        >
          Add Product
        </button>
        <button
          onClick={() => router.push('/services/new')}
          className="btn btn-secondary"
        >
          Add Service
        </button>
      </div>

      <div className="tabs mb-6">
        <button
          className={`tab tab-bordered ${activeTab === 'products' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab tab-bordered ${activeTab === 'services' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={`tab tab-bordered ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>
      {activeTab === 'products' && <ProductsList />}
      {activeTab === 'services' && <ServicesList />}
      {activeTab === 'users' && <UsersList />}
    </div>
  );
};

export default ExplorePage;
