'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import MiniItemCard from './MiniItemCard';
import Collapsible from '@/components/ui/Collapsible';

interface Service {
  _id: string;
  name: string;
  description: string;
  metrics?: { overallScore: number };
}

export default function ProfileServices({ userId }: { userId: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`/api/users/${userId}/services`)
      .then((r) => setServices(r.data.services || []))
      .catch(console.error);
  }, [userId]);

  return (
    <Collapsible title="Services">
      {services.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <MiniItemCard
              key={s._id}
              name={s.name}
              description={s.description}
              score={s.metrics?.overallScore}
              onClick={() => router.push(`/services/${s._id}`)}
            />
          ))}
        </div>
      ) : (
        <p>No services available for this user.</p>
      )}
    </Collapsible>
  );
}
