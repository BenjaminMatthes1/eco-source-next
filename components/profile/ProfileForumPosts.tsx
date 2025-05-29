'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Collapsible from '@/components/ui/Collapsible';

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  upvotes: number;
  author: { name: string };
}

export default function ProfileForumPosts({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`/api/forum/posts?authorId=${userId}`)
      .then((r) => setPosts(r.data.posts || []))
      .catch(console.error);
  }, [userId]);

  return (
    <Collapsible title="Forum Posts">
      {posts.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="p-3 bg-white border rounded shadow hover:shadow-lg cursor-pointer text-sm"
              onClick={() => router.push(`/dashboard/forum/posts/${post._id}`)}
            >
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-600 font-redditLight">
                By {post.author.name}
              </p>
              <p className="font-redditLight">
                {post.content.slice(0, 100)}…
              </p>
              <div className="flex items-center mt-2 font-redditLight">
                <span className="mr-2">Upvotes: {post.upvotes}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No forum posts available for this user.</p>
      )}
    </Collapsible>
  );
}
