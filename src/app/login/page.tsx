'use client';

import { FormEvent, useState } from 'react';
import { browserClient } from '@/lib/supabase/browserClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const { error: signInError } = await browserClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage('Check your email for the sign-in link.');
  };

  return (
    <section className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-xl font-semibold">Sign in with email OTP</h2>
      <p className="mb-4 text-sm text-slate-600">Enter your email and we&apos;ll send a one-time sign-in link.</p>
      <form className="space-y-3" onSubmit={submit}>
        <input
          className="w-full"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
        <button className="bg-slate-900 text-white" type="submit">
          Send login link
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
