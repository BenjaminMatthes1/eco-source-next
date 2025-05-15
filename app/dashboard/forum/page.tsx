// app/dashboard/forum/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import PostCard from '@/components/forum/PostCard';
import { Disclosure } from '@headlessui/react';

const postsPerPage = 10;

export default function ForumPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('upvotes');
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  /* ---------------- fetch ---------------- */
  useEffect(() => {
    const params = new URLSearchParams({
      q: keyword,
      sort,
      page: page.toString(),
      limit: postsPerPage.toString(),
    });
    axios.get(`/api/forum/posts?${params}`)
      .then(res => {
        setPosts(res.data.posts);
        setTotalPosts(res.data.totalPosts);
      })
      .catch(err => console.error(err));
  }, [keyword, sort, page]);

  /* ---------------- handlers ---------------- */
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setKeyword(e.target.value);
  const onSort   = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSort(e.target.value);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Forum</h1>

      {/* mobile filter drawer */}
      <Disclosure as="div" className="lg:hidden">
        {({ open }) => (
          <>
            <Disclosure.Button className="btn btn-neutral w-full mb-3">
              {open ? 'Hide Filters' : 'Show Filters'}
            </Disclosure.Button>
            <Disclosure.Panel className="space-y-2">
              <FilterBar keyword={keyword} sort={sort}
                         onSearch={onSearch} onSort={onSort} />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* desktop filters */}
      <div className="hidden lg:block mb-4">
        <FilterBar keyword={keyword} sort={sort}
                   onSearch={onSearch} onSort={onSort} />
      </div>

      <Link href="/dashboard/forum/new-post" className="btn btn-secondary mb-4">
        Create New Post
      </Link>

      {/* posts list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <PostCard key={p._id} post={p} />
        ))}
      </div>

      {/* pagination */}
      <Pagination
        page={page}
        total={totalPosts}
        perPage={postsPerPage}
        setPage={setPage}
      />
    </div>
  );
}

/* ---------- reusable sub‑components ---------- */

function FilterBar({
  keyword, sort, onSearch, onSort,
}: {
  keyword: string; sort: string;
  onSearch: (e: any) => void; onSort: (e: any) => void;
}) {
  return (
    <div className="flex mb-4">
      <input
        aria-label="Search posts"
        type="text"
        placeholder="Search posts…"
        value={keyword}
        onChange={onSearch}
        className="flex-grow p-2 border rounded-l"
      />
      <select
        aria-label="Sort posts"
        value={sort}
        onChange={onSort}
        className="p-2 border rounded-r font-redditLight text-white bg-primary"
      >
        <option value="upvotes">Upvotes</option>
        <option value="createdAt">Newest</option>
        <option value="title">Title</option>
      </select>
    </div>
  );
}

function Pagination({
  page, total, perPage, setPage,
  }: {
    page: number;
    total: number;
    perPage: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
  }) {
  const pages = Math.ceil(total / perPage);
  return (
    <div className="flex justify-between mt-4">
      <button
        aria-label="Previous page"
        onClick={() => setPage(p => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="btn btn-secondary"
      >Previous</button>
      <span>Page {page} of {pages}</span>
      <button
        aria-label="Next page"
        onClick={() => setPage(p => Math.min(p + 1, pages))}
        disabled={page >= pages}
        className="btn btn-secondary"
      >Next</button>
    </div>
  );
}
