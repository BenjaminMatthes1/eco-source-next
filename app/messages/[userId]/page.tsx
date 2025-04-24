// app/messages/[userId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Message, NewMessage } from '@/types/types'; // Adjust the import path as needed

const MessagesPage = () => {
  const params = useParams();
  const userId = params.userId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }


    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/${userId}`);
        const fetchedMessages: Message[] = response.data.messages;
        setMessages(fetchedMessages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Handle error
      }
    };

    const fetchRecipientInfo = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/profile`);
        const user = response.data.user;
        setRecipientName(user.name);
      } catch (error) {
        console.error('Error fetching recipient info:', error);
        // Handle error
      }
    };

    if (userId) {
      fetchMessages();
      fetchRecipientInfo();
    }
  }, [userId, router, status, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!session?.user?.id) {
      console.error('User is not authenticated');
      return;
    }

    const messageToSend: NewMessage = {
      senderId: session.user.id,
      recipientId: userId,
      content: newMessage.trim(),
    };

    try {
      await axios.post(`/api/messages/${userId}`, messageToSend);

      const newMessageObj: Message = {
        _id: 'temp-id-' + Date.now(),
        senderId: messageToSend.senderId,
        recipientId: messageToSend.recipientId,
        content: messageToSend.content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessageObj]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }
  

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 bg-base-200 shadow">
        <h1 className="text-xl font-bold">Chat with {recipientName || '...'}</h1>
        {/* Add more header content if needed */}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.senderId?.toString() === session?.user?.id;

            return (
              <div
                key={message._id}
                className={`chat ${isCurrentUser ? 'chat-end' : 'chat-start'}`}
              >
                <div
                  className={`chat-bubble ${isCurrentUser ? 'bg-primary text-white' : ''}`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-base-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="input input-bordered w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage} className="btn btn-primary">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
