'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { marked } from 'marked';
import { FaThumbsUp, FaReply } from 'react-icons/fa';
import Link from 'next/link';

interface CommentDoc {
  _id: string;
  author: { name: string; _id: string; profilePictureUrl?: string };
  content: string;
  parentComment?: string;
  createdAt?: string;
}

export default function PostDetailsPage() {
  const { data: session } = useSession();
  const router            = useRouter();
  const { postId }        = useParams() as { postId?: string };

  const [post, setPost]         = useState<any>(null);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [commentContent, setCommentContent] = useState('');

  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  /* ---------- fetch ----------- */
  useEffect(() => {
    if (!postId) return router.push('/dashboard/forum');
    (async () => {
      try {
        const [postRes, commRes] = await Promise.all([
          axios.get(`/api/forum/posts?postId=${postId}`),
          axios.get(`/api/forum/posts/${postId}/comments`),
        ]);
        setPost(postRes.data.posts[0]);
        setComments(commRes.data.comments);
      } catch (err) {
        console.error(err);
        router.push('/dashboard/forum');
      }
    })();
  }, [postId, router]);

  /* ---------- helpers ---------- */
  const root = comments.filter(c => !c.parentComment);
  const repliesFor = (id: string) => comments.filter(c => c.parentComment === id);

  const refreshComments = async () => {
    const res = await axios.get(`/api/forum/posts/${postId}/comments`);
    setComments(res.data.comments);
  };

  /* ---------- submit handlers ---------- */
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return router.push('/login');
    await axios.post(`/api/forum/posts/${postId}/comments`, { content: commentContent.trim() });
    setCommentContent('');
    refreshComments();
  };

  const submitReply = async (commentId: string) => {
    if (!replyContent.trim()) return;
  
    try {
      await axios.post(
        /*  ↓ back‑ticks – `${}` now interpolates  */
        `/api/forum/posts/${postId}/comments/${commentId}/reply`,
        { content: replyContent.trim() }
      );
  
      setReplyContent('');
      setActiveReply(null);
      refreshComments();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send reply');
    }
  };

  if (!post) return <p className="p-6">Loading…</p>;

  const authorAvatar =
    post.author.profilePictureUrl || '/images/default-profile.jpg';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral via-neutral/90 to-accent/60">

      <div className="max-w-3xl mx-auto pt-28 px-4 pb-16">
        {/* ---------- post card ---------- */}
        <article className="bg-primary/90 text-white rounded-lg shadow-lg p-8 backdrop-blur-md">

          {/* header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/profile/${post.author._id}`} className="flex-shrink-0">
              <Image
                src={authorAvatar}
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            </Link>

            <div>
              <h1 className="text-3xl font-bold mb-1">{post.title}</h1>
              <Link
                href={`/profile/${post.author._id}`}
                className="text-sm opacity-80 hover:underline"
              >
                {post.author.name}
              </Link>
              <span className="text-sm opacity-60">
                {' • '}
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* content */}
          <div
            className="prose prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }}
          />
          {/* attached images */}
            {Array.isArray(post.photos) && post.photos.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {post.photos.map((p: any) => (
                  <img
                    key={p._id}
                    src={p.url}
                    alt={p.name || 'post photo'}
                    className="w-32 h-32 rounded object-cover cursor-pointer hover:brightness-90"
                    onClick={() =>
                      window.open(p.url, '_blank', 'noopener,noreferrer')
                    }
                  />
                ))}
              </div>
            )}

          {/* up‑vote */}
          <button
            aria-label="Up‑vote post"
            onClick={async () => {
              await axios.post(`/api/forum/posts/${post._id}/upvote`);
              setPost((p: any) => ({ ...p, upvotes: p.upvotes + 1 }));
            }}
            className="btn btn-accent btn-sm flex items-center gap-1"
          >
            <FaThumbsUp /> {post.upvotes}
          </button>
        </article>

        {/* ---------- comment editor ---------- */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-primary-content">Comments</h2>

          <form onSubmit={submitComment} className="mb-8">
            <textarea
              aria-label="Add comment"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              required
              className="
                w-full h-28 p-4 rounded bg-primary/80 text-white
                border border-secondary focus:outline-none focus:ring
                placeholder:text-white/70
              "
              placeholder="Share your thoughts…"
            />
            <button
              type="submit"
              aria-label="Post comment"
              className="btn btn-secondary mt-2"
            >
              Comment
            </button>
          </form>

          {/* ---------- list ---------- */}
          <div className="space-y-6">
            {root.map((c) => (
              <CommentBlock
                key={c._id}
                c={c}
                replies={repliesFor(c._id)}
                activeReply={activeReply}
                setActiveReply={setActiveReply}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                submitReply={submitReply}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- reusable comment block ---------- */
function CommentBlock({
  c,
  replies,
  activeReply,
  setActiveReply,
  replyContent,
  setReplyContent,
  submitReply,
}: {
  c: CommentDoc;
  replies: CommentDoc[];
  activeReply: string | null;
  setActiveReply: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (t: string) => void;
  submitReply: (parentId: string) => void;
}) {
  const avatar = c.author.profilePictureUrl || '/images/default-profile.jpg';
  return (
    <div className="border-l-4 border-secondary pl-4">
      <div className="flex items-start gap-3 mb-2">
        <Link href={`/profile/${c.author._id}`} className="flex-shrink-0">
          <Image src={avatar} alt="" width={32} height={32} className="rounded-full" />
        </Link>

        <div>
          <Link
            href={`/profile/${c.author._id}`}
            className="font-semibold hover:underline"
          >
            {c.author.name}
          </Link>
          <p className="whitespace-pre-line">{c.content}</p>
        </div>
      </div>


      <button
        aria-label="Reply"
        onClick={() => setActiveReply(activeReply === c._id ? null : c._id)}
        className="btn btn-xs btn-accent flex items-center gap-1"
      >
        <FaReply /> Reply
      </button>

      {/* reply form */}
      {activeReply === c._id && (
        <div className="mt-3 ml-8">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full h-20 p-2 rounded bg-primary/70 text-white border border-secondary mb-2"
            placeholder="Your reply…"
          />
          <button
            onClick={() => submitReply(c._id)}
            className="btn btn-primary btn-xs"
          >
            Send
          </button>
        </div>
      )}

      {/* nested replies */}
      {replies.map((r) => (
        <div                   /* ← outer wrapper gets the key */
          key={r._id}
          className="mt-4 ml-6 pl-4 border-l"
        >
          <Link
            href={`/profile/${r.author._id}`}
            className="text-sm opacity-80 mb-1 hover:underline"
          >
            {r.author.name}
          </Link>

          <p className="whitespace-pre-line">{r.content}</p>
        </div>
      ))}
    </div>
  );
}
