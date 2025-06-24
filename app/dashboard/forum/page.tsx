// --- app/dashboard/forum/page.tsx (replace all) ---
'use client';

import { useEffect, useState, useTransition } from 'react';
import axios from 'axios';
import Link from 'next/link';
import PostCard from '@/components/forum/PostCard';
import { Disclosure } from '@headlessui/react';
import Select from 'react-select';
import { dropdownListStyle } from '@/utils/selectStyles';

const postsPerPage = 10;

/* tag list must match tagOptions used in new-post page */
export const tagOptions = [
  { label: 'Sustainable Materials', value: 'materials' },
  { label: 'Circular Economy',      value: 'circular'  },
  { label: 'Energy',                value: 'energy'    },
  { label: 'Water',                 value: 'water'     },
  { label: 'Policy',                value: 'policy'    },
];

export default function ForumPage() {
  const [posts, setPosts]           = useState<any[]>([]);
  const [keyword, setKeyword]       = useState('');
  const [sort, setSort]             = useState('upvotes');
  const [page, setPage]             = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [tags, setTags]             = useState<typeof tagOptions>([]);
  const [pending, startTx]          = useTransition();

  /* ------------- fetch list -------------- */
  useEffect(() => {
    const params = new URLSearchParams({
      q   : keyword,
      sort,
      page: page.toString(),
      limit: postsPerPage.toString(),
    });
    if (tags.length) params.append('tags', tags.map(t => t.value).join(','));

    startTx(() => {
      axios
        .get(`/api/forum/posts?${params}`)
        .then((res) => {
          setPosts(res.data.posts);
          setTotalPosts(res.data.totalPosts);
        })
        .catch((err) => console.error(err));
    });
  }, [keyword, sort, page, tags]);

  /* ------------- handlers ---------------- */
  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setKeyword(e.target.value);
  const onSort = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSort(e.target.value);

  /* ------------- UI ---------------------- */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Forum</h1>

      {/* mobile filter drawer */}
      <Disclosure as="div" className="lg:hidden">
        {({ open }) => (
          <>
            <Disclosure.Button className="btn btn-neutral w-full mb-3">
              {open ? 'Hide Filters' : 'Show Filters'}
            </Disclosure.Button>
            <Disclosure.Panel className="space-y-4">
              <FilterBar
                keyword={keyword}
                sort={sort}
                tags={tags}
                onSearch={onSearch}
                onSort={onSort}
                onTags={setTags}
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* desktop filters */}
      <div className="hidden lg:block mb-4">
        <FilterBar
          keyword={keyword}
          sort={sort}
          tags={tags}
          onSearch={onSearch}
          onSort={onSort}
          onTags={setTags}
        />
      </div>

      <Link href="/dashboard/forum/new-post" className="btn btn-secondary mb-6">
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

/* ---------- Filter bar ---------- */
function FilterBar({
  keyword,
  sort,
  tags,
  onSearch,
  onSort,
  onTags,
}: {
  keyword: string;
  sort: string;
  tags: typeof tagOptions;
  onSearch: (e: any) => void;
  onSort: (e: any) => void;
  onTags: (opt: any) => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-3 mb-4">
      <input
        aria-label="Search posts"
        type="text"
        placeholder="Search posts…"
        value={keyword}
        onChange={onSearch}
        className="flex-grow p-2 border rounded font-redditLight"
      />

      <Select
        isMulti
        inputId="tagFilter"
        options={tagOptions}
        value={tags}
        onChange={(v) => onTags(v)}
        styles={dropdownListStyle}
        placeholder="Filter by tags"
        maxMenuHeight={180}
        className="lg:min-w-[220px] flex-grow"
      />

      <select
        aria-label="Sort posts"
        value={sort}
        onChange={onSort}
        className="p-2 border rounded font-redditLight text-white bg-primary lg:w-40"
      >
        <option value="upvotes">Upvotes</option>
        <option value="createdAt">Newest</option>
        <option value="title">Title</option>
      </select>
    </div>
  );
}

/* ---------- Pagination ---------- */
function Pagination({
  page,
  total,
  perPage,
  setPage,
}: {
  page: number;
  total: number;
  perPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const pages = Math.ceil(total / perPage) || 1;
  return (
    <div className="flex justify-between mt-6">
      <button
        aria-label="Previous page"
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="btn btn-secondary"
      >
        Previous
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button
        aria-label="Next page"
        onClick={() => setPage((p) => Math.min(p + 1, pages))}
        disabled={page >= pages}
        className="btn btn-secondary"
      >
        Next
      </button>
    </div>
  );
}
