'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaThumbsUp, FaCommentAlt } from 'react-icons/fa';

interface Author {
  _id: string;
  name: string;
  profilePictureUrl?: string;
}

export interface PostCardData {
  _id: string;
  title: string;
  content: string;
  upvotes: number;
  commentCount: number;
  tags?: string[];
  author: Author;
}

export default function PostCard({ post }: { post: PostCardData }) {
  const avatarSrc =
    post.author.profilePictureUrl || '/images/default-profile.jpg';

  return (
    <div
      className="
        bg-base-100 border border-base-300 rounded-lg shadow-sm
        p-4 flex gap-4 max-w-md hover:shadow-lg transition-shadow
      "
    >
      {/* avatar */}
      <Link
        href={`/profile/${post.author._id}`}
        aria-label={`View ${post.author.name}'s profile`}
        className="flex-shrink-0"
      >
        <Image
          src={avatarSrc}
          alt={post.author.name}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
      </Link>

      {/* main */}
      <div className="flex-1">
        <Link
          href={`/dashboard/forum/posts/${post._id}`}
          className="font-semibold text-lg hover:underline"
        >
          {post.title}
        </Link>
        <p className="text-xs text-gray-500 mb-1">
          By {post.author.name}
        </p>

        <p className="text-sm mb-2 line-clamp-2">
          {post.content}
        </p>

        {/* tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="badge badge-outline badge-xs font-normal"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* metrics */}
        <div className="text-xs flex gap-4 items-center">
          <span className="flex items-center">
            <FaThumbsUp className="mr-1" /> {post.upvotes}
          </span>
          <span className="flex items-center">
            <FaCommentAlt className="mr-1" /> {post.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}
