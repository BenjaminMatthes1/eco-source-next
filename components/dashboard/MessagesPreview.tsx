// components/dashboard/MessagesPreview.tsx
import React, { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socketClient';
import { useRouter } from 'next/navigation';

interface MessagesPreviewProps {
  userId: string | undefined;
}

interface Message {
  _id: string;
  senderName: string;
  preview: string;
  timestamp: string;
}


const MessagesPreview: React.FC<MessagesPreviewProps> = ({ userId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
  
/* ----- helper so we can call it from socket too ----- */
const fetchThreads = () => {
  if (!userId) return;
    fetch(`/api/users/${userId}/messages`)
  .then((res) => res.json())
  .then((data) => {
    if (data.error) setError(data.error);
    else            setMessages(data);
    setLoading(false);
  })
    .catch((err) => {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages.');
      setLoading(false);
    });
  };
  
  /* initial load + socket subscription */
  useEffect(() => {
    if (!userId) return;
    fetchThreads();                 // first fetch
    const socket = getSocket(userId);        // open socket once
    socket.on('message:new', fetchThreads);   // refresh on any new msg
   return () => { socket.off('message:new', fetchThreads); };
   }, [userId]);
  
    if (loading) {
      return (
        <div className="bg-neutral rounded-lg shadow-lg p-8 mt-6 font-redditLight">
          <h2 className="text-2xl font-semibold mb-4">Recent Messages</h2>
          <p>Loading...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="bg-neutral rounded-lg shadow-lg p-8 mt-6 font-redditLight">
          <h2 className="text-2xl font-semibold mb-4">Recent Messages</h2>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
  
    return (
      <div className="bg-neutral rounded-lg shadow-lg p-8 mt-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Messages</h2>
        {messages.length > 0 ? (
          <ul className="text-lg font-redditLight">
            {messages.map((message) => (
              <li
                key={message._id}
                onClick={() => router.push(`/messages/${message._id}`)}
                className="mb-2 p-2 rounded cursor-pointer hover:bg-neutral-200 transition"
              >
                <strong>{message.senderName}:</strong> {message.preview}
                <br />
                <span className="text-sm text-gray-600">
                  {new Date(message.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg font-redditLight">No new messages.</p>
        )}
      </div>
    );
  };
  
  export default MessagesPreview;
  