// components/dashboard/RecentActivity.tsx
import React, { useEffect, useState } from 'react';

interface RecentActivityProps {
  userId: string | undefined;
}

interface Activity {
  _id: string;
  action: string;
  timestamp: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ userId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetch(`/api/users/${userId}/activity-logs`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setActivities(data);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching activity logs:', error);
          setError('Failed to load activity logs.');
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-neutral rounded-lg shadow-lg p-8 font-redditLight">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral rounded-lg shadow-lg p-8 font-redditLight">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
      {activities.length > 0 ? (
        <ul className="list-disc list-inside text-lg font-redditLight">
          {activities.map((activity) => (
            <li key={activity._id}>
              {activity.action} - {new Date(activity.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg font-redditLight">No recent activities.</p>
      )}
    </div>
  );
};

export default RecentActivity;
