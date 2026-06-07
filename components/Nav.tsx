'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Moon, MoreVertical, BookOpen, BarChart2, Settings, LogOut } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { createClient } from '@/lib/supabase/client';

export default function Nav() {
  const { T, dark, setDark } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const navItems = [
    { label: 'Record',   icon: BookOpen,  href: '/'         },
    { label: 'Report',   icon: BarChart2, href: '/report'   },
    { label: 'Settings', icon: Settings,  href: '/settings' },
  ];

  return (
    <nav className="no-print" style={{
      background: T.nav,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      height: 52,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <Link href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: T.navText, textDecoration: 'none' }}>
        Ledger
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => setDark(!dark)}
          style={{ background: 'transparent', border: 'none', color: T.sub, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, display: 'flex', alignItems: 'center' }}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: menuOpen ? (dark ? '#2a2a2a' : '#333') : 'transparent',
              border: 'none', color: menuOpen ? T.navText : T.sub,
              cursor: 'pointer', padding: '6px 8px', borderRadius: 6,
              display: 'flex', alignItems: 'center', transition: 'all 0.15s',
            }}
          >
            <MoreVertical size={17} />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 10, minWidth: 160, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'menuIn 0.15s ease',
              zIndex: 100,
            }}>
              {navItems.map(({ label, icon: Icon, href }, i) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px',
                    background: 'transparent',
                    color: T.sub,
                    textDecoration: 'none',
                    fontSize: 12, fontWeight: 500,
                    borderBottom: i < navItems.length - 1 ? `1px solid ${T.border}` : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = T.surface2)}
                  onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={14} />{label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 16px', background: 'transparent',
                  border: 'none', borderTop: `1px solid ${T.border}`,
                  color: T.red, fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={ev => (ev.currentTarget.style.background = T.surface2)}
                onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
