'use client';

import Link from 'next/link';
import CircularScore from '@/components/ui/circularScore';

interface UserCardProps {
  _id: string;
  name: string;
  bio: string;
  companyName?: string;
  profilePictureUrl?: string;
  createdAt?: string;                   // ← NEW
  metrics?: { overallScore: number };
}

export default function UserCard({
  _id,
  name,
  bio,
  companyName,
  profilePictureUrl,
  createdAt,
  metrics,
}: UserCardProps) {
  return (
    <Link
      href={`/profile/${_id}`}
      className="relative block bg-neutral rounded-lg shadow hover:shadow-xl transition p-4 text-primary h-full"
    >
      {/* member-since badge ------------------------------------ */}
      {createdAt && (
        <span className="absolute top-2 right-3 text-[10px] opacity-70">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      )}

      {/* picture ---------------------------------------------- */}
      <div className="flex justify-center">
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300" />
        )}
      </div>

      {/* name + company --------------------------------------- */}
      <h3 className="text-center font-semibold mt-3">{name}</h3>
      {companyName && (
        <p className="text-center text-xs">{companyName}</p>
      )}

      {/* short bio ------------------------------------------- */}
      <p className="text-xs text-center font-redditLight line-clamp-3 mt-2">
        {bio}
      </p>

      {/* overall score ring ----------------------------------- */}
      {metrics?.overallScore !== undefined ? (
        <div className="flex justify-center mt-3">
          <CircularScore score={metrics.overallScore} size={64} stroke={8} />
        </div>
      ) : (
        <p className="text-center text-xs mt-3">—</p>
      )}
    </Link>
  );
}
