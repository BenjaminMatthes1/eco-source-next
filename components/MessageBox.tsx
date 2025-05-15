'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socketClient';

interface MessageBoxProps {
  messages: any[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
  otherUserId: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  messages,
  onSendMessage,
  currentUserId,
  otherUserId,
  }) => {
  const [newMessage, setNewMessage] = useState('');
  const [liveMsgs, setLiveMsgs] = useState<any[]>(messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* connect socket once */
  useEffect(() => {
      const socket = getSocket(currentUserId);
      socket.on('message:new', (msg) => {
        // only push if it belongs to this thread
        if (
          (msg.senderId === currentUserId && msg.recipientId === otherUserId) ||
          (msg.senderId === otherUserId && msg.recipientId === currentUserId)
        ) {
          setLiveMsgs((prev) => [...prev, msg]);
        }
      });
      return () => { socket.off('message:new'); };
  }, [currentUserId, otherUserId]);
    
    /* auto‑scroll */
    useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [liveMsgs]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };



  return (
    <div className="bg-neutral-100 p-4 rounded-lg shadow-lg flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        {liveMsgs.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold text-primary">{msg.sender}</span>
            <span className="text-sm text-gray-500 ml-2">{msg.timestamp}</span>
            <p className="text-secondary mt-1">{msg.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center border-t pt-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="input input-bordered w-full mr-2"
        />
        <button onClick={handleSendMessage} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageBox;
