import React from 'react';

interface ProfileHeaderProps {
  profilePictureUrl?: string;
  name?: string;
  role?: string;
  companyName?: string;
  website?: string;
  createdAt?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profilePictureUrl, name, role, companyName, website, createdAt, }) => {
  return (
    <div className="flex items-center mb-6">
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt={`${name}'s profile picture`}
          className="w-24 h-24 rounded-full mr-4"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-300 mr-4 "></div>
      )}
      <div>
        <h1 className="text-3xl font-bold">{name}</h1>
        {role && <p className="text-sm text-gray-600 font-redditLight">Role: {role}</p>}
        {createdAt && (
       <p className="text-sm text-gray-600 font-redditLight">
         Member since {new Date(createdAt).toLocaleDateString()}
       </p>
     )}
        {companyName && (
          <p className="text-sm font-redditLight">
            Company: <span>{companyName}</span>
          </p>
        )}
        {website && (
          <p className="text-sm font-redditLight">
            Website:{' '}
            <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              {website}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
