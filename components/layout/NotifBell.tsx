'use client';
import { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socketClient';
import Link from 'next/link';
import { FaBell, FaTimes } from 'react-icons/fa';

export default function NotifBell({ userId }: { userId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* helpers */
  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setList(l => l.map(n => n._id === id ? { ...n, read: true } : n));
  };
  const removeOne = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setList(l => l.filter(n => n._id !== id));
    } catch (err) {
    console.error('Failed to delete notification', err);
    }
  };

  /* initial + realtime */
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/notifications`).then(r => r.json()).then(setList);

    const sock = getSocket(userId);
    sock.on('notification:new', (n: any) => setList(p => [n, ...p]));
    sock.on('notification:read', (id: string) =>
      setList(p => p.map(n => n._id === id ? { ...n, read: true } : n))
    );
    sock.on('notification:removed', (id: string) =>
      setList(p => p.filter(n => n._id !== id))
    );
    return () => { sock.off('notification:new'); sock.off('notification:read'); sock.off('notification:removed'); };
  }, [userId]);

  /* click-outside close */
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button className="btn btn-ghost" onClick={() => setOpen(o => !o)}>
        <div className="indicator">
          <FaBell className="text-xl" />
          {list.some(n => !n.read) && (
            <span className="badge badge-error badge-xs indicator-item" />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-base-100 shadow-lg rounded p-2 z-50 max-h-96 overflow-y-auto">
          {list.length === 0 && (
            <p className="p-2 text-sm opacity-70">No notifications</p>
          )}

          {list.slice(0, 20).map(n => (
            <div
              key={n._id}
              className={`group flex items-start gap-2 p-2 rounded cursor-pointer
                          ${n.read ? 'opacity-60' : 'font-semibold bg-primary/10'}`}
              onClick={() => { if (!n.read) markRead(n._id); }}
            >
              {/* message (link or span) */}
              {n.link ? (
                <Link href={n.link} className="flex-1 hover:underline">
                  {n.message}
                </Link>
              ) : (
                <span className="flex-1">{n.message}</span>
              )}

              {/* delete (appears on hover) */}
              <button
                className="opacity-0 group-hover:opacity-100 transition text-error"
                onClick={(e) => { e.stopPropagation(); removeOne(n._id); }}
                aria-label="Dismiss"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
