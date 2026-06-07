'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getIcon } from '@/lib/constants';
import type { Entry } from '@/lib/types';

interface Props {
  entry: Entry;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EntryDetailCard({ entry, onEdit, onDelete, onClose }: Props) {
  const { T, dark, fmt } = useApp();
  const Icon = getIcon(entry.tag);
  const col = entry.kind === 'income' ? T.green : T.red;
  const isIncome = entry.kind === 'income';

  const rows = [
    { label: 'Category', value: entry.tag,  icon: <Icon size={14} color={col} strokeWidth={1.8} /> },
    entry.note   ? { label: 'Details',                              value: entry.note   } : null,
    entry.person ? { label: isIncome ? 'Received from' : 'Sent to', value: entry.person } : null,
    { label: 'Type', value: isIncome ? 'Income' : 'Expense' },
  ].filter(Boolean) as { label: string; value: string; icon?: React.ReactNode }[];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 301,
        background: dark ? 'rgba(22,22,22,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '20px 20px 0 0',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        padding: '20px 24px 40px',
        animation: 'sheetUp 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: '0 auto 20px' }} />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, color: col, fontWeight: 400 }}>
            {isIncome ? '+' : '−'}{fmt(entry.amount)}
          </div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 4, letterSpacing: '0.06em' }}>{entry.date}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surface2, padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {row.icon ?? <div style={{ width: 14 }} />}
                <span style={{ fontSize: 12, color: T.muted }}>{row.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onEdit} style={{
            flex: 1, padding: '14px 0', background: T.surface2, color: T.text,
            border: `1px solid ${T.border}`, borderRadius: 12,
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <Pencil size={14} /> Edit
          </button>
          <button onClick={onDelete} style={{
            flex: 1, padding: '14px 0', background: 'transparent', color: T.red,
            border: `1px solid ${T.red}44`, borderRadius: 12,
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </>
  );
}
