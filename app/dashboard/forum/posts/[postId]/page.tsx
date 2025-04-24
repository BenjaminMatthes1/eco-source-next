'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation'; // Use useParams for dynamic segments

const PostDetailsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams(); // Correctly retrieve the route parameter
  const postId = params?.postId; // Access postId from params

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    if (!postId) {
      router.push('/dashboard/forum'); // Redirect if postId is unavailable
      return;
    }

    const fetchData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          axios.get(`/api/forum/posts?postId=${postId}`),
          axios.get(`/api/forum/posts/${postId}/comments`),
        ]);

        setPost(postRes.data.posts[0]);
        setComments(commentsRes.data.comments);
      } catch (error) {
        console.error('Error fetching post or comments:', error);
        router.push('/dashboard/forum'); // Redirect on fetch error
      }
    };

    fetchData();
  }, [postId, router]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push('/login');
      return;
    }

    try {
      await axios.post(`/api/forum/posts/${postId}/comments`, {
        content: commentContent,
      });
      setCommentContent('');
      // Refresh comments
      const commentsRes = await axios.get(`/api/forum/posts/${postId}/comments`);
      setComments(commentsRes.data.comments);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-600 mb-4">By {post.author.name}</p>
      <p className="mb-6">{post.content}</p>
      <div className="flex items-center mb-6">
        <span className="mr-2">Upvotes: {post.upvotes}</span>
        <button
          onClick={async () => {
            try {
              await axios.post(`/api/forum/posts/${post._id}/upvote`);
              // Update the post's upvotes
              setPost((prev: any) => ({
                ...prev,
                upvotes: prev.upvotes + 1,
              }));
            } catch (error: any) {
              if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
              } else {
                console.error('Error upvoting post:', error);
              }
            }
          }}
          className="btn btn-primary btn-xs"
        >
          Upvote
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      <form onSubmit={handleCommentSubmit} className="mb-6">
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded h-24 mb-2"
          placeholder="Add a comment..."
        ></textarea>
        <button type="submit" className="btn btn-secondary">
          Post Comment
        </button>
      </form>
      <div className="space-y-4">
        {comments.map((comment: any) => (
          <div key={comment._id} className="border p-4 rounded">
            <p className="text-gray-600">By {comment.author.name}</p>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostDetailsPage;
