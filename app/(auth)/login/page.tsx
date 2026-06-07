'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('error') === 'auth_callback_failed'
      ? 'Email confirmation failed. Please try again.'
      : ''
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      // Full reload so the middleware sees the fresh session cookies
      window.location.href = '/';
    }
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 400,
      borderRadius: 20,
      background: 'rgba(28,28,28,0.9)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      padding: '36px 32px',
    }}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#e8e2d4', marginBottom: 6, fontWeight: 400 }}>
        Welcome back
      </div>
      <div style={{ fontSize: 13, color: '#777', marginBottom: 32 }}>Sign in to your Ledger</div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && (
          <div style={{ fontSize: 12, color: '#e05c5c', background: 'rgba(224,92,92,0.1)', borderRadius: 8, padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#777' }}>
        No account?{' '}
        <Link href="/signup" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>
          Sign up
        </Link>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#252525',
  border: '1px solid #2e2e2e',
  borderRadius: 10,
  padding: '13px 16px',
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  color: '#e8e2d4',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 0',
  background: '#c9a84c',
  color: '#111111',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  cursor: 'pointer',
  letterSpacing: '0.04em',
  marginTop: 4,
};
