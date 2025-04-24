// components/dashboard/AccountDetails.tsx
import React from 'react';
import { User } from 'next-auth';


interface AccountDetailsProps {
  user: {
    email?: string;
    role?: string;
    subscriptionStatus?: string;
  };
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ user }) => {
  return (
    <div className="bg-neutral rounded-lg shadow-lg p-8 text-primary">
      <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
      
      <p className="text-lg mb-2">
        <strong className="text-primary">Email:</strong>
        <span className="ml-2 text-black font-redditLight  ">
          {user?.email ?? 'Not provided'}
        </span>
      </p>

      <p className="text-lg mb-2">
        <strong className="text-primary">Role:</strong>
        <span className="ml-2 text-black font-redditLight">
          {user?.role ?? 'Not specified'}
        </span>
      </p>

      <p className="text-lg mb-2">
        <strong className="text-primary">Subscription Status:</strong>
        <span className="ml-2 text-black font-redditLight">
          {user?.subscriptionStatus ?? 'Free'}
        </span>
      </p>
    </div>
  );
};

export default AccountDetails;