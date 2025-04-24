// components/dashboard/MessagesPreview.tsx
import React, { useEffect, useState } from 'react';

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
  
    useEffect(() => {
      if (userId) {
        fetch(`/api/users/${userId}/messages`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
            } else {
              setMessages(data);
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages.');
            setLoading(false);
          });
      }
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
              <li key={message._id} className="mb-2">
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
  