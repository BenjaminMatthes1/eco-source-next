'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import EditServiceForm from '@/components/forms/services/EditServiceForm';
import { Service } from '@/types/types';

const EditServicePage = () => {
  const { serviceId } = useParams() as { serviceId: string };
  const router          = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await axios.get(`/api/services/${serviceId}`);
        setService(data.service);
      } catch (err) {
        console.error('Error fetching service:', err);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) fetchService();
  }, [serviceId, router]);

  const handleFormSubmit = async (formData: Partial<Service>) => {
    try {
      await axios.put(`/api/services/${serviceId}`, formData);
      router.push(`/services/${serviceId}`);
    } catch (err) {
      console.error('Error updating service:', err);
    }
  };

  if (loading)    return <p className="m-6">Loading…</p>;
  if (!service)   return <p className="m-6 text-red-500">Service not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Service</h1>
      <EditServiceForm service={service} onSubmit={handleFormSubmit} />
    </div>
  );
};

export default EditServicePage;
