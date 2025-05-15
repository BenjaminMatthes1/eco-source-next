// components/dashboard/Notifications.tsx
import React, { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socketClient';
import Link from 'next/link';

interface NotificationsProps {
  userId: string | undefined;
}

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  timestamp: string;
  link: string;
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

          /* real‑time updates */
          const socket = getSocket(userId);
          const handler = (notif: Notification) =>
            setNotifications((prev) => [notif, ...prev]);
          socket.on('notification:new', handler);
          return () => {                                          // ⬅ new (returns void)
                socket.off('notification:new', handler);
              };
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

    /* ---------------- mark notification as read ---------------- */
const markRead = async (id: string) => {
  try {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  } catch (err) {
    console.error('Failed to mark notification read', err);
  }
};


return (
  <div className="bg-neutral rounded-lg shadow-lg p-8">
    <h2 className="text-2xl font-semibold mb-4">Notifications</h2>

    <ul className="text-lg font-redditLight">
      {notifications.map((n) => (
        <li key={n._id} className="mb-2">
          {n.link ? (
            <Link
              href={n.link}
              className={`block p-2 rounded hover:bg-neutral
                          ${n.read ? 'opacity-70' : 'bg-primary/20'}`}
              onClick={() => markRead(n._id)}
            >
              {n.message}
              <span className="block text-xs text-gray-500">
                {new Date(n.timestamp).toLocaleString()}
              </span>
            </Link>
          ) : (
            <span
              className={`block p-2 rounded
                          ${n.read ? 'opacity-70' : 'bg-primary/20'}`}
            >
              {n.message}
              <span className="block text-xs text-gray-500">
                {new Date(n.timestamp).toLocaleString()}
              </span>
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
);
  };
  
  export default Notifications;