'use client';

import Link from 'next/link';
import LiquidGauge from '@/components/ui/LiquidGauge';

interface ProductCardProps {
  _id: string;
  name: string;
  description: string;
  price: number;
  photos?: { url: string }[];
  metrics?: { overallScore: number };
}

export default function ProductCard({
  _id,
  name,
  description,
  price,
  photos = [],
  metrics,
}: ProductCardProps) {
  const cover = photos[0]?.url;

  return (
    <Link
      href={`/products/${_id}`}
      className="block bg-neutral rounded-lg shadow hover:shadow-xl transition p-4 text-primary h-full"
    >
      {cover ? (
        <img
          src={cover}
          alt={name}
          className="w-full h-40 object-cover rounded"
        />
      ): (
  <div className="w-full h-40 bg-base-200 rounded flex items-center justify-center">
    <span className="text-xs opacity-60">No photo</span>
  </div>
      )}

      <h2 className="text-center font-semibold mt-3">{name}</h2>
      <p className="text-xs text-center font-redditLight line-clamp-3 mt-1">
        {description}
      </p>
      <p className="text-center text-sm font-bold mt-1">${price}</p>

      {metrics?.overallScore !== undefined ? (
        <div className="flex justify-center mt-3">
          <LiquidGauge score={metrics.overallScore} size={70} />
        </div>
      ) : (
        <p className="text-center text-xs mt-3">—</p>
      )}
    </Link>
  );
}
