'use client';

import Link from 'next/link';
import { BarChart2, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Props { pathname: string; }

export default function FAB({ pathname }: Props) {
  const { T, dark } = useApp();

  const config: Record<string, { icon: typeof BarChart2; label: string; href: string }> = {
    '/':        { icon: BarChart2, label: 'Report', href: '/report'   },
    '/report':  { icon: Plus,      label: 'Record', href: '/'         },
    '/settings':{ icon: Plus,      label: 'Record', href: '/'         },
  };

  const fab = config[pathname];
  if (!fab) return null;

  const Icon = fab.icon;

  return (
    <Link
      href={fab.href}
      className="no-print"
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        height: 46, paddingLeft: 24, paddingRight: 24, borderRadius: 100,
        background: dark ? 'rgba(201,168,76,0.15)' : 'rgba(26,26,26,0.08)',
        color: dark ? '#c9a84c' : '#1a1a1a',
        border: dark ? '1.5px solid rgba(201,168,76,0.5)' : '1.5px solid rgba(26,26,26,0.2)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.05em',
        boxShadow: dark ? '0 4px 20px rgba(201,168,76,0.2)' : '0 4px 20px rgba(0,0,0,0.12)',
        animation: 'fabPop 0.25s ease',
        zIndex: 40,
        textDecoration: 'none',
      }}
    >
      <Icon size={15} />
      {fab.label}
    </Link>
  );
}
