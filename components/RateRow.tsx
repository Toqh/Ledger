'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Props {
  value: number;
  label: string;
  onSave: (val: number) => void;
}

export default function RateRow({ value, label, onSave }: Props) {
  const { T } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) { setDraft(String(value)); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [editing, value]);

  function commit() {
    const n = parseInt(draft);
    if (n > 0) onSave(n);
    setEditing(false);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surface2, borderRadius: 10, padding: '10px 14px' }}>
      <span style={{ fontSize: 12, color: T.muted, flex: 1 }}>{label}</span>
      {editing ? (
        <>
          <span style={{ fontSize: 12, color: T.muted }}>₦</span>
          <input
            ref={inputRef}
            type="number"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            style={{ width: 90, background: 'transparent', border: 'none', borderBottom: `1.5px solid ${T.text}`, outline: 'none', fontSize: 14, fontWeight: 700, color: T.text, fontFamily: 'inherit', textAlign: 'right', padding: '2px 0' }}
          />
          <button onClick={commit} style={{ background: 'none', border: 'none', color: T.green, cursor: 'pointer', padding: '0 2px', display: 'flex' }}>
            <Check size={15} />
          </button>
          <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: '0 2px', display: 'flex' }}>
            <X size={13} />
          </button>
        </>
      ) : (
        <>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>₦{value.toLocaleString()}</span>
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: '0 2px', display: 'flex', transition: 'color 0.15s' }}
            onMouseEnter={ev => (ev.currentTarget.style.color = T.text)}
            onMouseLeave={ev => (ev.currentTarget.style.color = T.muted)}
          >
            <Pencil size={13} />
          </button>
        </>
      )}
    </div>
  );
}
