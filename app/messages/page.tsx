import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Conversation } from '@/types/types';

const MessagesInbox = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('/api/messages/conversations');
        setConversations(response.data.conversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (session) {
      fetchConversations();
    }
  }, [session]);

  return (
    <div>
      <h1>Your Messages</h1>
      {conversations.map((conversation) => (
        <Link href={`/messages/${conversation.otherUserId}`} key={conversation.otherUserId}>
          <div>
            <p>Conversation with {conversation.otherUserName}</p>
            <p>Last message: {conversation.lastMessageContent}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MessagesInbox;
