'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Msg {
  _id: string;
  name: string;
  email: string;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export default function ContactMsgs() {
  const [msgs, setMsgs] = useState<Msg[]>([]);

  async function load() {
    const { data } = await axios.get('/api/admin/contact-messages');
    setMsgs(data);
  }

  async function mark(id: string) {
    await axios.patch('/api/admin/contact-messages', { id });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
      <div className="space-y-4">
        {msgs.map(m => (
          <div key={m._id} className="card bg-base-100 shadow p-4">
            <p className="font-semibold">{m.name} · {m.email}</p>
            <p className="mt-2">{m.message}</p>
            <p className="text-xs opacity-70 mt-2">
              {new Date(m.createdAt).toLocaleString()}
            </p>
            {!m.resolved && (
              <button className="btn btn-sm btn-primary mt-3" onClick={() => mark(m._id)}>
                Mark resolved
              </button>
            )}
            {m.resolved && <span className="badge badge-success mt-3">Resolved</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
