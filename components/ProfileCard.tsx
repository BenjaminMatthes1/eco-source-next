'use client';

import React from 'react';

interface ProfileCardProps {
  name: string;
  role: string;
  email: string;
  subscriptionStatus: 'free' | 'subscribed' | 'premium';
  location?: string;
  companyName?: string;
  website?: string;
  profilePictureUrl?: string;
  interests?: string[];
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  email,
  subscriptionStatus,
  location,
  companyName,
  website,
  profilePictureUrl,
  interests = [],
}) => {
  return (
    <div className="p-6 bg-neutral-100 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-center space-x-4">
        <img
          src={profilePictureUrl || '/public/logo-no-background.png'}
          alt={`${name}'s profile`}
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h2 className="text-2xl font-bold text-primary">{name}</h2>
          <p className="text-sm text-secondary">{role}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">Email: {email}</p>
        <p className="text-sm text-gray-600">Subscription: {subscriptionStatus}</p>
        {location && <p className="text-sm text-gray-600">Location: {location}</p>}
        {companyName && <p className="text-sm text-gray-600">Company: {companyName}</p>}
        {website && (
          <p className="text-sm text-gray-600">
            Website: <a href={website} className="text-blue-600" target="_blank" rel="noopener noreferrer">{website}</a>
          </p>
        )}
      </div>
      {interests.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold">Interests</h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {interests.map((interest, index) => (
              <li key={index}>{interest}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
