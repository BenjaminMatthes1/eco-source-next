// app/messages/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const MessagesPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [threads, setThreads] = useState([]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }
  
  useEffect(() => {
    
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    axios
      .get('/api/messages/threads')
      .then((response) => {
        setThreads(response.data.threads);
      })
      .catch((error) => {
        console.error('Error fetching message threads:', error);
      });
  }, [router, status]);

  return (
    <div className="container mx-auto py-6 px-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      {threads.map((user: any) => (
        <div key={user._id} className="border-b py-2">
          <a href={`/messages/${user._id}`} className="text-secondary">
            Conversation with {user.name || user.companyName}
          </a>
        </div>
      ))}
    </div>
  );
};

export default MessagesPage;
