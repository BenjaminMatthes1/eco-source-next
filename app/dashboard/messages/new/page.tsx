// app/messages/new/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const NewMessagePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const recipientId = searchParams.get('recipientId');

  const [recipient, setRecipient] = useState<any>(null);
  const [content, setContent] = useState('');
  const [conversationId, setConversationId] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    // Fetch recipient data
    if (recipientId) {
      axios.get(`/api/users/${recipientId}/profile`)
        .then(response => {
          setRecipient(response.data);
        })
        .catch(error => {
          console.error('Error fetching recipient:', error);
          router.back();
        });
    }
  }, [recipientId, router, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create or get conversation
      const convResponse = await axios.post('/api/conversations', { recipientId });
      const convId = convResponse.data.conversation._id;
      setConversationId(convId);

      // Send message
      await axios.post(`/api/conversations/${convId}/messages`, { content });

      // Redirect to conversation page
      router.push(`/messages/${convId}`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!recipient) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-4">New Message to {recipient.name || recipient.companyName}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full h-32 p-2 border border-gray-300 rounded"
          placeholder="Type your message..."
        ></textarea>
        <button type="submit" className="btn btn-secondary">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default NewMessagePage;
