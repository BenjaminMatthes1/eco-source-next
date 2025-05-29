'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from './UserCard';

interface User {
  _id: string;
  name: string;
  bio: string;
  role: string;
  location?: string;
  profilePictureUrl?: string;
  metrics?: { overallScore: number};
  companyName: string;
}

export default function UsersList() {
  const [users,      setUsers]   = useState<User[]>([]);
  const [categories, setCats]    = useState<string[]>([]);
  const [keyword,    setKeyword] = useState('');
  const [query,      setQuery]   = useState('');
  const [cat,        setCat]     = useState('');
  const [role,       setRole]    = useState('');

  useEffect(() => {
    axios.get('/api/users/categories')
      .then(r => setCats(r.data.categories))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params: any = {};
    if (query) params.q = query;
    if (cat)   params.userCategory = cat;
    if (role)  params.role = role;

    axios.get('/api/users', { params })
      .then(r => setUsers(r.data.users))
      .catch(console.error);
  }, [query, cat, role]);

  return (
    <div>
      {/* search */}
      <div className="flex gap-2 mb-4">
        <input
          className="input input-bordered flex-1"
          placeholder="Search users…"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => setQuery(keyword.trim())}>
          Search
        </button>
      </div>

      {/* category chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button
            key={c}
            className={`badge px-4 py-2 cursor-pointer ${cat===c ? 'badge-primary' : 'badge-ghost'}`}
            onClick={() => setCat(cat===c ? '' : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* role filter */}
      <select
        className="select select-bordered mb-6"
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <option value="">All roles</option>
        <option value="buyer">Buyer</option>
        <option value="supplier">Supplier</option>
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {users.map((u) => {
        const score = u.metrics?.overallScore;   // may be number | undefined
        return (
          <UserCard
            key={u._id}
            _id={u._id}
            name={u.name}
            bio={u.bio}
            companyName={u.companyName}
            profilePictureUrl={u.profilePictureUrl}
            metrics={score !== undefined ? { overallScore: score } : undefined}
          />
        );
      })}
      </div>
    </div>
  );
}