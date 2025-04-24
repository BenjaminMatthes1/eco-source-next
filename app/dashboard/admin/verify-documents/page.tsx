'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PendingDoc {
  model: string;      // "product" | "service" | "user"
  parentId: string;   // e.g. product _id
  documentId: string; // doc sub-ID
  name: string;
  url: string;
  category?: string;
  verified: boolean;
  rejectionReason?: string;
  uploadedAt?: string;
}

export default function VerifyDocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard'); // or wherever you want non-admins to go
      return;
    }

    // fetch pending docs
    (async () => {
      try {
        const res = await fetch('/api/documents/pending');
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to load docs');
        }
        const data = await res.json();
        setPendingDocs(data.pending || []);
      } catch (err: any) {
        console.error('Error fetching pending docs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, router]);

  const handleApprove = async (doc: PendingDoc) => {
    try {
      const res = await fetch(`/api/documents/${doc.model}/${doc.documentId}/approve`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Approve failed');
      }
      // remove doc from local list
      setPendingDocs((prev) => prev.filter((d) => d.documentId !== doc.documentId));
    } catch (err: any) {
      alert('Error approving doc: ' + err.message);
    }
  };

  const handleReject = async (doc: PendingDoc) => {
    const reason = prompt('Enter a rejection reason (optional):') || '';
    try {
      const res = await fetch(`/api/documents/${doc.model}/${doc.documentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Reject failed');
      }
      // remove doc from local list
      setPendingDocs((prev) => prev.filter((d) => d.documentId !== doc.documentId));
    } catch (err: any) {
      alert('Error rejecting doc: ' + err.message);
    }
  };

  if (loading) return <p className="m-4">Loading unverified documents...</p>;
  if (error) return <p className="text-red-500 m-4">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Document Verification</h1>
      {pendingDocs.length === 0 ? (
        <p>No pending documents.</p>
      ) : (
        <table className="table w-full">
          <thead>
            <tr>
              <th>Doc Name</th>
              <th>Model</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingDocs.map((doc) => (
              <tr key={doc.documentId}>
                <td>
                  <a href={doc.url} target="_blank" rel="noreferrer" className="link link-primary">
                    {doc.name}
                  </a>
                </td>
                <td>{doc.model}</td>
                <td>{doc.category || 'N/A'}</td>
                <td>
                  <button
                    className="btn btn-success btn-xs mr-2"
                    onClick={() => handleApprove(doc)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-error btn-xs"
                    onClick={() => handleReject(doc)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
