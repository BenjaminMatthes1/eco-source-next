'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
const params = useParams<{ token: string }>(); // typed params
const { token } = useParams() as { token: string };
  const router = useRouter();
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (pw1 !== pw2) {
      setError('Passwords do not match.');
      return;
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: pw1 }),
    });

    if (!res.ok) {
      setError('Link is invalid or expired.');
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/auth/login'), 2500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-6">
      <div className="w-full max-w-md rounded-xl bg-base-100 p-8 shadow">
        {done ? (
          <p className="text-center">
            Password updated! Redirecting to login…
          </p>
        ) : (
          <>
            <h1 className="mb-6 text-2xl font-semibold">Choose a new password</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="New password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                required
              />
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Confirm new password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
              />
              {error && <p className="text-error">{error}</p>}
              <button type="submit" className="btn btn-primary w-full">
                Reset password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
