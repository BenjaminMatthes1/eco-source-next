'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import ProfileHeader from '@/components/profile/ProfileHeader';
import Interests from '@/components/profile/Interests';
import ProfileProducts from '@/components/profile/ProfileProducts';
import ProfileServices from '@/components/profile/ProfileServices';
import ProfileForumPosts from '@/components/profile/ProfileForumPosts';
import { useSession } from 'next-auth/react';
import ERSMetricsProfile from '@/components/profile/ERSMetricsProfile';
import Collapsible from '@/components/ui/Collapsible';
import Loading from '@/components/ui/Loading'

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
  createdAt?: string;
  chosenMetrics?: string[];
  metrics?: { [k: string]: any };
}


const UserProfilePage = () => {
  const { userId } = useParams() as { userId?: string };
  if (!userId) return <p className="p-6">Invalid user id</p>;
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  

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
    return <Loading />;
  }

  const handleMessageClick = async () => {
    if (!session?.user?.id) {
      router.push('/');
      return;
    }
    try {
      const res   = await fetch('/api/messages/threads');
      const json  = await res.json();
      const exists = json.threads?.some(
        (u: { _id: string }) => u._id === user._id
      );
      // Regardless of exists, navigate to the same URL; the page loads msgs (0 or many)
      router.push(`/messages/${user._id}`);
    } catch {
      router.push(`/messages/${user._id}`); // network error fallback
    }
  };

return (
  <div className="flex justify-center p-6 bg-primary">
    <div className="w-full bg-white rounded-lg shadow-lg p-8">
      {/* ───────── Profile header ───────── */}
      <ProfileHeader
        profilePictureUrl={user.profilePictureUrl}
        name={user.name}
        role={user.role}
        companyName={user.companyName}
        website={user.website}
        createdAt={user.createdAt}
      />

      {user.bio && (
        <p className="mt-2 mb-4 font-redditLight">{user.bio}</p>
      )}

      {/* ───────── Edit / Message button ───────── */}
      {session?.user?.id === user._id ? (
        <div className="flex justify-start mb-4">
          <button
            className="btn btn-secondary"
            onClick={() => router.push('/profile/edit')}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="flex justify-end mb-4">
          <button onClick={handleMessageClick} className="btn btn-primary">
            Message&nbsp;{user.name || 'User'}
          </button>
        </div>
      )}

      {/* ───────── Two-column layout ───────── */}
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* LEFT: stack of collapsibles */}
        <div className="flex-1 flex flex-col gap-6">
          <ProfileForumPosts userId={user._id} />
          <ProfileProducts   userId={user._id} />
          <ProfileServices   userId={user._id} />
        </div>

        {/* RIGHT: metrics panel, grows to match left column height */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <ERSMetricsProfile
            chosenMetrics={user.chosenMetrics ?? []}
            metrics={user.metrics ?? {}}
            overall={
              user.metrics?.overallScore ??
              (user.ersMetrics as any)?.overallScore
            }
          />
        </div>
      </div>
    </div>
  </div>
);
}

export default UserProfilePage;
