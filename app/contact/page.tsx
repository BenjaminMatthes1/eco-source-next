'use client';

import { useState, FormEvent } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>(
    'idle'
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    setStatus('loading');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setStatus('sent');
      form.reset();
    } else {
      setStatus('error');
    }
  }

  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-8 text-primary">Contact&nbsp;Us</h1>

      <p className="text-lg mb-6">
        Have questions or feedback? We&apos;d love to hear from you. Fill out
        the form below and we&apos;ll get back to you as soon as possible.
      </p>

      {/* feedback banner */}
      {status === 'sent' && (
        <div className="alert alert-success mb-6">Message sent! 🎉</div>
      )}
      {status === 'error' && (
        <div className="alert alert-error mb-6">
          Something went wrong. Please try again later.
        </div>
      )}

      <form
        className="max-w-xl mx-auto space-y-6"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="input input-bordered w-full"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input input-bordered w-full"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="textarea textarea-bordered w-full"
            placeholder="How can we help?"
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
