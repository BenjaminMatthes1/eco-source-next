'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Service {
  _id: string;
  name: string;
  description: string;
}

const ProfileServices = ({ userId }: { userId: string }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/services`);
        setServices(response.data.services || []);
      } catch (error) {
        console.error('Error fetching user services:', error);
      }
    };

    if (userId) {
      fetchServices();
    }
  }, [userId]);

  return (
    <div className="bg-neutral rounded-lg shadow-lg p-8 mt-8">
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="cursor-pointer flex justify-between items-center"
      >
        <h2 className="text-2xl font-semibold mb-4">Services</h2>
        <button className="text-lg">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="p-4 bg-white border rounded shadow-md hover:shadow-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => router.push(`/services/${service._id}`)}
            >
              <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
              <p className="text-sm text-black font-redditLight">{service.description}</p>
            </div>
          ))}
        </div>
      )}
      {!isExpanded && services.length === 0 && (
        <p>No services available for this user.</p>
      )}
    </div>
  );
};

export default ProfileServices;
