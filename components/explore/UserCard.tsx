'use client';

import Link from 'next/link';

interface UserCardProps {
  _id: string;
  name: string;
  bio: string;
  profilePictureUrl?: string;
  // updated structure for user ERS
  ersMetrics?: {
    overallScore: number;
  };
}

const UserCard: React.FC<UserCardProps> = ({
  _id,
  name,
  bio,
  profilePictureUrl,
  ersMetrics,
}) => {
  return (
    <div className="border p-4 rounded shadow-md hover:shadow-lg transition-shadow">
      {/* Profile Picture */}
      {profilePictureUrl && (
        <img
          src={profilePictureUrl}
          alt={`${name}'s Profile`}
          className="w-full h-40 object-cover mb-2 rounded"
        />
      )}

      {/* Details */}
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-gray-600 line-clamp-2">{bio}</p>

      {/* ERS Metrics */}
      {ersMetrics && (
        <p className="text-green-500 font-bold mt-2">
          ERS Score: {ersMetrics.overallScore} / 100
        </p>
      )}

      {/* View Profile */}
      <Link href={`/profile/${_id}`} className="btn btn-secondary mt-4">
        View Profile
      </Link>
    </div>
  );
};

export default UserCard;
