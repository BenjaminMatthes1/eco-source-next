'use client';
import { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socketClient';
import Link from 'next/link';
import { FaBell } from 'react-icons/fa';

export default function NotifBell({ userId }: { userId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setList(l => l.map(n => n._id === id ? { ...n, read: true } : n));
  };

  /* initial + realtime */
  useEffect(() => {
    if (!userId) return;

    fetch(`/api/users/${userId}/notifications`)
      .then(r => r.json()).then(setList);
  
    const sock = getSocket(userId);
    const handler = (n: any) => setList(p => [n, ...p]);
    sock.on('notification:new', handler);
    return () => { sock.off('notification:new', handler); }; 
  }, [userId]);

  /* click outside close */
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        className="btn btn-ghost"
        onClick={() => setOpen(o => !o)}
      >
        <div className="indicator">
          <FaBell className="text-xl" />
          {list.some(n => !n.read) && <span className="badge badge-error badge-xs indicator-item" />}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-base-100 shadow-lg rounded p-2 z-50">
          {list.length === 0 && <p className="p-2 text-sm font-redditLight text-primary pb-2">No notifications</p>}
          {list.slice(0, 10).map(n => (
             n.link ? (
                    <Link
                      href={n.link}
                      key={n._id}
                      className={`block text-sm p-2 rounded hover:bg-neutral pb-2
                                  ${n.read ? 'opacity-70' : ''}`}
                      onClick={() => markRead(n._id)}
                    >
                      {n.message}
                    </Link>
                  ) : (
                    <span
                      key={n._id}
                      className={`block text-sm p-2 rounded pb-2
                                  ${n.read ? 'opacity-70' : 'bg-primary/20'}`}
                      onClick={() => markRead(n._id)}
                    >
                      {n.message}
                    </span>
                  )
          ))}
        </div>
      )}
    </div>
  );
}
