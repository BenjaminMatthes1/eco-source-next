'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { StarsInput } from '@/components/ui/Stars';
import {
  FaArrowUp,
  FaArrowLeft,
  FaArrowRight,
  FaWindowClose,
} from 'react-icons/fa';
import PhotoPicker, { ExistingPhoto } from '@/components/forms/PhotoPicker';

type Review = {
  _id: string;
  userId: { _id: string; name?: string; profilePictureUrl?: string };
  rating: number;
  comment: string;
  upvotes?: number;
  upvotedBy?: string[];
  photos?: { _id: string; url: string; key?: string; name?: string }[];
};

interface Props {
  itemType: 'product' | 'service';
  itemId: string;
  initial: Review[];
  isOwner: boolean;
}

export default function ReviewSection({
  itemType,
  itemId,
  initial,
  isOwner,
}: Props) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [draft, setDraft] = useState({ rating: '', comment: '' });
  const [photos, setPhotos] = useState<ExistingPhoto[]>([]);
  const [error, setError] = useState('');

  /* ────────── light-box state ────────── */
  const [lightbox, setLightbox] = useState<{
    photos: { url: string; name?: string }[];
    index: number;
  } | null>(null);

  const openLightbox = (
    photos: { url: string; name?: string }[],
    idx: number
  ) => setLightbox({ photos, index: idx });
  const closeLightbox = () => setLightbox(null);
  const next = () =>
    lightbox &&
    setLightbox({
      ...lightbox,
      index: (lightbox.index + 1) % lightbox.photos.length,
    });
  const prev = () =>
    lightbox &&
    setLightbox({
      ...lightbox,
      index:
        lightbox.index === 0 ? lightbox.photos.length - 1 : lightbox.index - 1,
    });

  const base = itemType === 'product' ? '/api/products' : '/api/services';
  const myId: string | null = session?.user?.id ?? null;
  const alreadyReviewed = reviews.some((r) => r.userId._id === myId);

  /* ────────── submit review ────────── */
  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${base}/${itemId}/reviews`, {
        ...draft,
        photos: photos.map((p) => ({
          url: p.url,
          key: p.key,
          name: p.name,
        })),
      });
      setReviews((prev) => [...prev, res.data.review]);
      setDraft({ rating: '', comment: '' });
      setPhotos([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  }

  /* ────────── up-vote ────────── */
  async function upvote(reviewId: string) {
    try {
      const res = await axios.post(
        `${base}/${itemId}/reviews/${reviewId}/upvote`
      );
      const upvotes = res.data.upvotes;
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, upvotes } : r))
      );
    } catch {
      /* ignore duplicate-vote */
    }
  }

  /* ────────── helpers ────────── */
  const Star = ({ filled }: { filled: boolean }) => (
    <span className={filled ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  );
  const StarRating = ({ v }: { v: number }) => {
    const full = Math.floor(v);
    const half = v - full >= 0.5;
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < full || (i === full && half)} />
        ))}
      </div>
    );
  };

  /* ────────── UI ────────── */
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Reviews</h2>

      {/* ░░ new-review form ░░ */}
      {!isOwner && !alreadyReviewed && (
        <form
          onSubmit={submitReview}
          className="space-y-4 max-w-md bg-primary/10 p-4 rounded-lg"
        >
          <div>
            <label className="block text-sm mb-1">Rating</label>
            <StarsInput
              value={parseFloat(draft.rating || '0')}
              onChange={(val) => setDraft({ ...draft, rating: String(val) })}
            />
          </div>
          <div>
            <label className="block text-sm">Comment</label>
            <textarea
              value={draft.comment}
              onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
              className="w-full border p-2"
              required
            />
          </div>

          {/* photo picker */}
          <PhotoPicker
            photos={photos}
            onDelete={async (id) =>
              setPhotos((p) => p.filter((x) => x._id !== id))
            }
            onUpload={async (files) => {
              const uploaded = await Promise.all(
                files.map(async (f) => {
                  const form = new FormData();
                  form.append('file', f);
                  form.append('entity', itemType);
                  form.append('kind', 'reviewphoto');
                  const { data } = await axios.post('/api/uploads', form);

                  const uuid =
                    typeof crypto.randomUUID === 'function'
                      ? crypto.randomUUID()
                      : `${Date.now()}-${Math.random()
                          .toString(16)
                          .slice(2)}`;

                  return {
                    _id: uuid,
                    url: data.url,
                    key: data.key,
                    name: f.name,
                  };
                })
              );
              setPhotos((p) => [...p, ...uploaded]);
            }}
          />

          <button type="submit" className="btn btn-secondary">
            Submit Review
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      )}

      {/* ░░ review cards ░░ */}
      <div className="grid gap-4 mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => {
          const voted = myId ? r.upvotedBy?.includes(myId) : false;
          return (
            <div
              key={r._id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={
                    r.userId.profilePictureUrl ?? '/images/default-profile.jpg'
                  }
                  alt={r.userId.name ?? 'Reviewer'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <Link
                  href={`/profile/${r.userId._id}`}
                  className="font-semibold hover:underline"
                >
                  {r.userId.name ?? 'Anonymous'}
                </Link>
              </div>

              <StarRating v={r.rating} />

              <p className="text-sm whitespace-pre-line mt-2">{r.comment}</p>

              {/* thumbnails */}
              {Array.isArray(r.photos) && r.photos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {r.photos.map((p, idx) => (
                    <img
                      key={p._id}
                      src={p.url}
                      onClick={() => openLightbox(r.photos!, idx)}
                      className="w-12 h-12 object-cover rounded cursor-pointer hover:brightness-90"
                    />
                  ))}
                </div>
              )}

              {/* up-vote */}
              <button
                onClick={() => upvote(r._id)}
                disabled={voted}
                className={`mt-3 flex items-center gap-1 text-sm ${
                  voted
                    ? 'text-green-600 cursor-default'
                    : 'hover:text-green-700'
                }`}
              >
                <FaArrowUp /> {r.upvotes ?? 0}
              </button>
            </div>
          );
        })}
      </div>

      {/* ░░ light-box modal ░░ */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-3xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-white text-3xl"
              onClick={closeLightbox}
            >
              <FaWindowClose />
            </button>

            <img
              src={lightbox.photos[lightbox.index].url}
              alt={
                lightbox.photos[lightbox.index].name || 'Expanded review photo'
              }
              className="object-contain w-full max-h-[80vh] rounded"
            />

            {lightbox.photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl"
                >
                  <FaArrowRight />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
