'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => { router.push('/'); router.refresh(); }, 1500);
    }
  }

  if (done) {
    return (
      <div style={{
        width: '100%', maxWidth: 400, borderRadius: 20,
        background: 'rgba(28,28,28,0.9)', backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        padding: '36px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#4caf7d', marginBottom: 8 }}>
          Account created
        </div>
        <div style={{ fontSize: 13, color: '#777' }}>Redirecting to your Ledger…</div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', maxWidth: 400, borderRadius: 20,
      background: 'rgba(28,28,28,0.9)', backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      padding: '36px 32px',
    }}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#e8e2d4', marginBottom: 6, fontWeight: 400 }}>
        Create account
      </div>
      <div style={{ fontSize: 13, color: '#777', marginBottom: 32 }}>Start tracking your cashflow</div>

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
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />

        {error && (
          <div style={{ fontSize: 12, color: '#e05c5c', background: 'rgba(224,92,92,0.1)', borderRadius: 8, padding: '10px 14px' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#777' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>
          Sign in
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
