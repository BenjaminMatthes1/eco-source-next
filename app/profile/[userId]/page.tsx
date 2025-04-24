'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ERSMetrics from '@/components/profile/ERSMetrics';
import Interests from '@/components/profile/Interests';
import ProfileProducts from '@/components/profile/ProfileProducts';
import ProfileServices from '@/components/profile/ProfileServices';
import ProfileForumPosts from '@/components/profile/ProfileForumPosts';

interface IUserERSMetrics {
  economicImpactRating: number;       // 0–10
  additionalEthicalPractices: string[];
  carbonFootprint: number;
  carbonOffsets: number;
  hasSustainabilityPolicy: boolean;
  charitableDonationsPercent: number;
  hasVolunteerPrograms: boolean;
  overallScore: number;
}

interface UserProfile {
  _id: string;
  name?: string;
  bio?: string;
  profilePictureUrl?: string;
  role?: string;
  companyName?: string;
  website?: string;
  interests?: string[];
  location?: string;
  subscriptionStatus?: string;
  ersMetrics?: IUserERSMetrics;
}

const UserProfilePage = () => {
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/profile`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        router.push('/404');
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, router]);

  if (!user) {
    return <p className="p-6">Loading profile...</p>;
  }

  return (
    <div className="flex justify-center p-6 bg-primary">
      <div className="w-full bg-white rounded-lg shadow-lg p-8">
        {/* Profile Header */}
        <ProfileHeader
          profilePictureUrl={user.profilePictureUrl}
          name={user.name}
          role={user.role}
          companyName={user.companyName}
          website={user.website}
        />

        {/* Display the NEW ERS metrics */}
        <ERSMetrics metrics={user.ersMetrics} />

        {/* Interests */}
        <Interests interests={user.interests} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProfileProducts userId={user._id} />
          <ProfileServices userId={user._id} />
        </div>

        {/* Forum Posts */}
        <ProfileForumPosts userId={user._id} />
      </div>
    </div>
  );
};

export default UserProfilePage;
