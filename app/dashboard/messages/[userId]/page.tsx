// app/messages/[userId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const MessageConversationPage = ({ params }: { params: { userId: string } }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    const fetchMessages = async () => {
      try {
        const [messagesRes, recipientRes] = await Promise.all([
          axios.get(`/api/messages/${params.userId}`),
          axios.get(`/api/users/${params.userId}/profile`),
        ]);

        setMessages(messagesRes.data.messages);
        setRecipient(recipientRes.data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages or recipient:', error);
        router.back();
      }
    };

    fetchMessages();
  }, [params.userId, router, status]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`/api/messages`, {
        recipientId: params.userId,
        content,
      });
      setContent('');
      // Refresh messages
      const response = await axios.get(`/api/messages/${params.userId}`);
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!recipient) {
    return <p>Loading...</p>;
  }
  
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto py-12 px-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">
        Conversation with {recipient.name || recipient.companyName}
      </h1>
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((msg: any) => (
          <div
            key={msg._id}
            className={`mb-2 ${
              msg.senderId === session?.user.id ? 'text-right' : 'text-left'
            }`}
          >
            <p className="inline-block px-4 py-2 rounded bg-gray-200">
              {msg.content}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="flex-grow p-2 border border-gray-300 rounded-l"
          placeholder="Type your message..."
        />
        <button type="submit" className="btn btn-secondary rounded-l-none">
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageConversationPage;
