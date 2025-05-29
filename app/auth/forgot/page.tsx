'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0); // seconds remaining

  /* helper to hit the API */
  async function requestReset(targetEmail: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail }),
    });
    return res.ok;
  }

  /* initial submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!(await requestReset(email))) {
      setError('Could not send reset email. Try again later.');
      return;
    }
    setSent(true);
    startCooldown();
  }

  /* resend link */
  async function handleResend() {
    setError('');
    if (!(await requestReset(email))) {
      setError('Resend failed. Try again later.');
      return;
    }
    startCooldown();
  }

  /* 30-second timer */
  function startCooldown() {
    setCooldown(30);
    const t = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-6">
      <div className="w-full max-w-md rounded-xl bg-base-100 p-8 shadow">
        {sent ? (
          <>
            <p className="text-center">
              If an account exists for <strong>{email}</strong>, a reset link is
              on the way.
            </p>

            <button
              className="btn btn-outline btn-primary mt-4 w-full"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend link (${cooldown}s)` : 'Resend link'}
            </button>

            {error && <p className="mt-2 text-error text-center">{error}</p>}
          </>
        ) : (
          <>
            <h1 className="mb-6 text-2xl font-semibold">
              Forgot your password?
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-error">{error}</p>}
              <button type="submit" className="btn btn-primary w-full">
                Send reset link
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
