// components/dashboard/Notifications.tsx
import React, { useEffect, useState } from 'react';

interface NotificationsProps {
  userId: string | undefined;
}

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

const Notifications: React.FC<NotificationsProps> = ({ userId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      if (userId) {
        fetch(`/api/users/${userId}/notifications`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
            } else {
              setNotifications(data);
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching notifications:', error);
            setError('Failed to load notifications.');
            setLoading(false);
          });
      }
    }, [userId]);
  
    if (loading) {
      return (
        <div className="bg-neutral rounded-lg shadow-lg p-8 font-redditLight">
          <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
          <p>Loading...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="bg-neutral rounded-lg shadow-lg p-8 font-redditLight">
          <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
  
    return (
      <div className="bg-neutral rounded-lg shadow-lg p-8 ">
        <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
        {notifications.length > 0 ? (
          <ul className="text-lg font-redditLight">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`mb-2 p-2 rounded ${
                  notification.read ? 'bg-gray-200' : 'bg-primary bg-opacity-20'
                }`}
              >
                {notification.message} - {new Date(notification.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg font-redditLight">No new notifications.</p>
        )}
      </div>
    );
  };
  
  export default Notifications;