// app/dashboard/forum/new-post/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Select from 'react-select';
import { dropdownListStyle } from '@/utils/selectStyles';
import { marked } from 'marked';

interface TagOption { label: string; value: string }

const tagOptions: TagOption[] = [
  { label: 'Sustainable Materials', value: 'materials' },
  { label: 'Circular Economy',      value: 'circular'  },
  { label: 'Energy',               value: 'energy'    },
  { label: 'Water',                value: 'water'     },
  { label: 'Policy',               value: 'policy'    },
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [tags, setTags]         = useState<TagOption[]>([]);
  const [tab, setTab]           = useState<'write'|'preview'>('write');
  const [pending, startTx]      = useTransition();
  const [error, setError]       = useState<string | null>(null);

  /* char limits */
  const titleMax    = 120;
  const contentMax  = 3000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;

    startTx(async () => {
      try {
        await axios.post('/api/forum/posts', {
          title:   title.trim(),
          content: content.trim(),
          tags:    tags.map(t => t.value),
        });
        router.push('/dashboard/forum');
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.error ?? 'Failed to post');
      }
    });
  };

  /* -------------- UI -------------- */
  return (
    <div className="flex flex-1 items-start justify-center pt-24 pb-12 px-4">
    <div className="bg-primary bg-opacity-90 text-white w-full max-w-3xl p-8 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-center">Create New Post</h1>

      {/* error toast */}
      {error && (
        <div className="alert alert-error mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TITLE */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium font-redditLight">
            Title
          </label>
          <input
            id="title"
            aria-label="Post title"
            type="text"
            value={title}
            maxLength={titleMax}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full bg-transparent text-white
            border-0 border-b border-white
            focus:border-secondary focus:outline-none  transition-colors duration-150 
            placeholder:text-white/60 "
          />
          <p className="text-xs text-right">
            {title.length}/{titleMax}
          </p>
        </div>

        {/* TAGS */}
        <div>
          <label className="block text-sm font-medium mb-1 font-redditLight">Tags</label>
          <Select<TagOption, true>
            isMulti
            options={tagOptions}
            value={tags}
            onChange={(v) => setTags([...v] as TagOption[])}
            styles={dropdownListStyle}
            placeholder="Pick up to 5 tags"
            inputId="tag-select"
            aria-label="Tag selector"
            maxMenuHeight={180}
          />
        </div>

        {/* EDITOR TABS */}
        <div>
          <div className="tabs mb-2">
            <button
              type="button"
              className={`font-redditLight tab tab-bordered ${tab === 'write' ? 'tab-active' : ''}`}
              onClick={() => setTab('write')}
            >
              Write
            </button>
            <button
              type="button"
              className={`font-redditLight tab tab-bordered ${tab === 'preview' ? 'tab-active' : ''}`}
              onClick={() => setTab('preview')}
            >
              Preview
            </button>
          </div>

          {tab === 'write' ? (
            <>
              <textarea
                aria-label="Post content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                maxLength={contentMax}
                className=" w-full h-60 p-3 mt-1 rounded
                bg-primary/80 text-white
                border border-secondary
                focus:outline-none focus:ring-1 focus:ring-accent
                placeholder:text-white/70"
                placeholder="Write in Markdown…"
              />
              <p className="text-xs text-right">
                {content.length}/{contentMax}
              </p>
            </>
          ) : (
            <div
              className="prose max-w-none p-4 border rounded h-60 overflow-y-auto bg-base-200"
              dangerouslySetInnerHTML={{ __html: marked.parse(content || '*Nothing to preview*') }}
            />
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          aria-label="Publish post"
          disabled={
            pending ||
            !title.trim() ||
            !content.trim() ||
            title.length > titleMax ||
            content.length > contentMax
          }
          className="btn btn-secondary"
        >
          {pending ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
    </div>
  );
}
