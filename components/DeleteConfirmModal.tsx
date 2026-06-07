'use client';

import { Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getIcon } from '@/lib/constants';
import type { Entry } from '@/lib/types';

interface Props {
  entry: Entry;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ entry, onConfirm, onCancel }: Props) {
  const { T, dark, fmt } = useApp();
  const Icon = getIcon(entry.tag);
  const col = entry.kind === 'income' ? T.green : T.red;

  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 301, width: 'min(360px, calc(100vw - 40px))',
        borderRadius: 20,
        background: dark ? 'rgba(28,28,28,0.9)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '28px 24px 24px',
        animation: 'glassIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: T.surface2, borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <Icon size={18} color={col} strokeWidth={1.8} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{entry.tag}</div>
            {entry.note && <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{entry.note}</div>}
            {entry.person && <div style={{ fontSize: 12, color: T.muted }}>{entry.kind === 'income' ? 'from' : 'to'} {entry.person}</div>}
            <div style={{ fontSize: 12, color: T.muted }}>{entry.date}</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: col, whiteSpace: 'nowrap' }}>
            {entry.kind === 'income' ? '+' : '−'}{fmt(entry.amount)}
          </div>
        </div>

        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: T.text, marginBottom: 6, fontWeight: 400 }}>
          Delete this entry?
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 24 }}>This can't be undone.</div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '13px 0', background: T.surface2, color: T.sub,
            border: `1px solid ${T.border}`, borderRadius: 12,
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '13px 0', background: T.red, color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </>
  );
}
