'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Props {
  date: string;
  onChange: (d: string) => void;
  kindColor: string;
}

export default function CompactDate({ date, onChange, kindColor }: Props) {
  const { T } = useApp();
  const [open, setOpen] = useState(false);
  const isToday = date === new Date().toISOString().slice(0, 10);
  const display = isToday
    ? 'Today'
    : new Date(date + 'T00:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ textAlign: 'center', marginBottom: 12 }}>
      {open ? (
        <input
          type="date"
          value={date}
          autoFocus
          onChange={e => { onChange(e.target.value); setOpen(false); }}
          onBlur={() => setOpen(false)}
          style={{
            background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8,
            padding: '6px 12px', fontSize: 12, fontFamily: 'inherit', color: T.text,
            outline: 'none', cursor: 'pointer',
          }}
        />
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'none', border: 'none', color: T.muted, fontSize: 12,
            fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          <Pencil size={10} color={T.muted} />
          {display}
        </button>
      )}
    </div>
  );
}
