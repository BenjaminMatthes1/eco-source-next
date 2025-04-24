// app/dashboard/forum/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const ForumPage = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('upvotes');

const [page, setPage] = useState(1);
const [totalPosts, setTotalPosts] = useState(0);
const postsPerPage = 10; // Adjust as needed


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams();
        if (filter) params.append('filter', filter);
        if (sort) params.append('sort', sort);
        params.append('page', page.toString());
        params.append('limit', postsPerPage.toString());

        const response = await axios.get(`/api/forum/posts?${params.toString()}`);
        setPosts(response.data.posts);
        setTotalPosts(response.data.totalPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [filter, sort, page]);



  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Forum</h1>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={filter}
          onChange={handleFilterChange}
          className="flex-grow p-2 border border-gray-300 rounded-l"
        />
        <select
          value={sort}
          onChange={handleSortChange}
          className="p-2 border border-gray-300 rounded-r"
        >
          <option value="upvotes">Upvotes</option>
          <option value="createdAt">Newest</option>
          <option value="title">Title</option>
        </select>
      </div>
      <Link href="/dashboard/forum/new-post" className="btn btn-secondary mb-4">
        Create New Post
      </Link>
      <div className="space-y-4">
        {posts.map((post: any) => (
          <div key={post._id} className="border p-4 rounded">
            <Link href={`/dashboard/forum/posts/${post._id}`} className="text-xl font-semibold">
              {post.title}
            </Link>
            <p className="text-gray-600">By {post.author.name}</p>
            <p>{post.content.slice(0, 100)}...</p>
            <div className="flex items-center mt-2">
              <span className="mr-2">Upvotes: {post.upvotes}</span>
              <button
                onClick={async () => {
                  try {
                    await axios.post(`/api/forum/posts/${post._id}/upvote`);
                    setPosts((prevPosts) =>
                      prevPosts.map((p) =>
                        p._id === post._id ? { ...p, upvotes: p.upvotes + 1 } : p
                      )
                    );
                  } catch (error) {
                    console.error('Error upvoting post:', error);
                  }
                }}
                className="btn btn-primary btn-xs"
              >
                Upvote
              </button>
            </div>
          </div>
        ))}
      </div>
    <div className="flex justify-between mt-4">
        <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="btn btn-secondary"
        >
            Previous
        </button>
        <span>
            Page {page} of {Math.ceil(totalPosts / postsPerPage)}
        </span>
        <button
            onClick={() =>
            setPage((prev) =>
                prev < Math.ceil(totalPosts / postsPerPage) ? prev + 1 : prev
            )
            }
            disabled={page >= Math.ceil(totalPosts / postsPerPage)}
            className="btn btn-secondary"
        >
            Next
        </button>
        </div>
    </div>
  );
};

export default ForumPage;
