'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import MiniItemCard from './MiniItemCard';
import Collapsible from '@/components/ui/Collapsible';

interface Product {
  _id: string;
  name: string;
  description: string;
  metrics?: { overallScore: number };
}

export default function ProfileProducts({ userId }: { userId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`/api/users/${userId}/products`)
      .then((r) => setProducts(r.data.products || []))
      .catch(console.error);
  }, [userId]);

  return (
    <Collapsible title="Products">
      {products.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <MiniItemCard
              key={p._id}
              name={p.name}
              description={p.description}
              score={p.metrics?.overallScore}
              onClick={() => router.push(`/products/${p._id}`)}
            />
          ))}
        </div>
      ) : (
        <p>No products available for this user.</p>
      )}
    </Collapsible>
  );
}
