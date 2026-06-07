import Link from 'next/link';

export default function LandingPage() {
  return (
    <main style={{
      minHeight: '100dvh',
      background: '#0e0e0e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Top nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 28px', height: 56,
        background: 'rgba(14,14,14,0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 50,
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#e8e2d4' }}>
          Ledger
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={navLinkStyle}>Sign in</Link>
          <Link href="/signup" style={ctaSmallStyle}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', maxWidth: 560, marginTop: 32 }}>
        <div style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
          color: '#c9a84c', textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          Personal Finance
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(40px, 8vw, 64px)',
          fontWeight: 400,
          lineHeight: 1.1,
          color: '#e8e2d4',
          margin: '0 0 20px',
        }}>
          Your cashflow,<br />beautifully tracked.
        </h1>

        <p style={{
          fontSize: 16, color: '#888', lineHeight: 1.7,
          margin: '0 0 40px',
        }}>
          Record income and expenses in seconds. See where your money goes
          with rich reports, category drill-downs, and multi-currency support.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={ctaStyle}>Start for free</Link>
          <Link href="/login" style={secondaryStyle}>Sign in</Link>
        </div>
      </div>

      {/* Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        maxWidth: 760,
        width: '100%',
        marginTop: 80,
      }}>
        {features.map(f => (
          <div key={f.title} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '20px 22px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e2d4', marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 80, fontSize: 12, color: '#444' }}>
        Built for personal use · Your data, your control
      </div>
    </main>
  );
}

const features = [
  { icon: '⚡', title: 'Quick entry',      desc: 'A guided 5-step flow gets any transaction recorded in under 10 seconds.' },
  { icon: '📊', title: 'Monthly reports',  desc: 'Opening balance, totals, category breakdown, and daily sparklines.' },
  { icon: '🔍', title: 'Drill-down',       desc: 'Tap any category to see note groups and individual transactions.' },
  { icon: '💱', title: 'Multi-currency',   desc: 'Switch between NGN, USD, and EUR with live exchange rates.' },
];

const navLinkStyle: React.CSSProperties = {
  color: '#888', textDecoration: 'none', fontSize: 13, fontWeight: 500,
  padding: '6px 14px', borderRadius: 8, transition: 'color 0.15s',
};

const ctaSmallStyle: React.CSSProperties = {
  background: '#c9a84c', color: '#111', textDecoration: 'none',
  fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 8,
};

const ctaStyle: React.CSSProperties = {
  background: '#c9a84c', color: '#111', textDecoration: 'none',
  fontSize: 14, fontWeight: 700, padding: '13px 28px', borderRadius: 10,
  letterSpacing: '0.03em',
};

const secondaryStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', color: '#e8e2d4', textDecoration: 'none',
  fontSize: 14, fontWeight: 600, padding: '13px 28px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
};
