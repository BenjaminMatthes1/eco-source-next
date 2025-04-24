'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  upvotes: number;
  author: {
    name: string;
  };
}

const ProfileForumPosts = ({ userId }: { userId: string }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`/api/forum/posts?authorId=${userId}`);
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error('Error fetching user forum posts:', error);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  if (posts.length === 0) {
    return (
      <div className="bg-neutral rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Forum Posts</h2>
        <p>No forum posts available for this user.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral rounded-lg shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Forum Posts</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post._id}
            className="border p-4 rounded hover:shadow-lg cursor-pointer"
            onClick={() => router.push(`/dashboard/forum/posts/${post._id}`)}
          >
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-sm text-gray-600">By {post.author.name}</p>
            <p>{post.content.slice(0, 100)}...</p>
            <div className="flex items-center mt-2">
              <span className="mr-2">Upvotes: {post.upvotes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileForumPosts;
