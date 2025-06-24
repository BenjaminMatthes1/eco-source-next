'use client';

import Link from 'next/link';
import LiquidGauge from '@/components/ui/LiquidGauge';

interface ServiceCardProps {
  _id: string;
  name: string;
  description: string;
  category: string;
  serviceCost?: number;
  photos?: { url: string }[];
  metrics?: { overallScore: number };
}

export default function ServiceCard({
  _id,
  name,
  description,
  category,
  serviceCost,
  photos = [],
  metrics,
}: ServiceCardProps) {
  const cover = photos[0]?.url;

  return (
    <Link
      href={`/services/${_id}`}
      className="block bg-neutral rounded-lg shadow hover:shadow-xl transition p-4 text-primary h-full"
    >
      {cover && (
        <img
          src={cover}
          alt={name}
          className="w-full h-40 object-cover rounded"
        />
      )}

      <h2 className="text-center font-semibold mt-3">{name}</h2>
      <p className="text-xs text-center font-redditLight line-clamp-3 mt-1">
        {description}
      </p>
      <p className="text-center text-[11px] opacity-70">{category}</p>
      {serviceCost !== undefined && (
        <p className="text-center text-sm font-bold mt-1">${serviceCost}</p>
      )}

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
