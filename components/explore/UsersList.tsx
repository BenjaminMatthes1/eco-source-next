'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from './UserCard'; // Use the new UserCard component

interface User {
  _id: string;
  name: string;
  bio: string;
  profilePictureUrl?: string;
  ersMetrics?: {
    overallScore: number;
  };
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/users/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching user categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params: any = {};
        if (categoryFilter) params.userCategory = categoryFilter;
        const response = await axios.get('/api/users', { params });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [categoryFilter]);

  return (
    <div>
      <div className="flex mb-4">
        {categories.map((category) => (
          <button
            key={category}
            className={`btn mr-2 ${categoryFilter === category ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategoryFilter(category)}
          >
            {category}
          </button>
        ))}
        {categoryFilter && (
          <button className="btn btn-secondary" onClick={() => setCategoryFilter('')}>
            Clear Filter
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((user) => (
          <UserCard key={user._id} {...user} />
        ))}
      </div>
    </div>
  );
};

export default UsersList;
