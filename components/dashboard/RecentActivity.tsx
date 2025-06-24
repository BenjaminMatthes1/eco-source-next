'use client';

import React, { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';

interface RecentActivityProps { userId?: string }

interface Log { _id: string; action: string; timestamp: string }
interface Notif {
  _id: string;
  message: string;
  timestamp: string;
  link: string;
}

export default function RecentActivity({ userId }: RecentActivityProps) {
  const [items, setItems]   = useState<(Log|Notif)[]>([]);
  const [loading, setL]     = useState(true);
  const [error,   setErr]   = useState<string|null>(null);

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      fetch(`/api/users/${userId}/activity-logs`).then(r => r.json()),
      fetch(`/api/users/${userId}/notifications`).then(r => r.json()),
    ])
      .then(([logs, notifs]) => {
        const merged = [
          ...(logs || []),
          ...(notifs || []),
        ].sort((a,b) =>
          new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf()
        );
        setItems(merged);
      })
      .catch(() => setErr('Could not load activity'))
      .finally(() => setL(false));
  }, [userId]);

  if (loading) return <Loading size={40} />;

  if (error) {
    return (
      <div className="bg-neutral rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>

      {items.length ? (
        <ul className="space-y-2 text-sm font-redditLight">
          {items.map((it: any) => (
            <li key={it._id}>
              {'link' in it ? (
                <span className="flex items-start gap-2 group">
                  <a href={it.link} className="flex-1 hover:underline">
                    {it.message}
                  </a>
                  <button
                    className="text-sm opacity-0 group-hover:opacity-100"
                    onClick={async () => {
                      await fetch(`/api/notifications/${it._id}`, { method: 'DELETE' });
                      setItems(p => p.filter(x => x._id !== it._id));
                    }}
                  >
                    X
                  </button>
                </span>
              ) : (
                it.action
              )}
              <span className="opacity-60">
                {' '}
                — {new Date(it.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className='font-redditLight'>No recent activity.</p>
      )}
    </div>
  );
}
