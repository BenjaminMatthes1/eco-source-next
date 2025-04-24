'use client';

import React, { useState } from 'react';

interface MessageBoxProps {
  messages: { sender: string; content: string; timestamp: string }[];
  onSendMessage: (message: string) => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-neutral-100 p-4 rounded-lg shadow-lg flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold text-primary">{msg.sender}</span>
            <span className="text-sm text-gray-500 ml-2">{msg.timestamp}</span>
            <p className="text-secondary mt-1">{msg.content}</p>
          </div>
        ))}
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
