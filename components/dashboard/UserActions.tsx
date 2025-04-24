// components/dashboard/UserActions.tsx
'use client'
import React from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

const UserActions: React.FC = () => {
  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="bg-neutral rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-4">Your Actions</h2>
      <p className="text-lg mb-4 font-redditLight">
        Access your profile, update preferences, and explore other dashboard features.
      </p>
      <div className="flex space-x-4">
        <Link href = "/profile/edit">
          <button className="btn btn-primary">Edit Profile</button>
        </Link>
        <button className="btn btn-secondary" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserActions;
