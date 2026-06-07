'use client';

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Entry } from '@/lib/types';

interface Props {
  entries: Entry[];
  tag: string;
  kind: string;
  editId?: string;
  onPick: (val: number) => void;
}

export default function AmountSuggestions({ entries, tag, kind, editId, onPick }: Props) {
  const { T } = useApp();

  const suggestions = useMemo(() => {
    if (!tag) return [];
    const tagEntries = entries.filter(e => e.tag === tag && e.kind === kind && e.id !== editId && e.amount > 0);
    const freq = new Map<number, number>();
    tagEntries.forEach(e => freq.set(e.amount, (freq.get(e.amount) || 0) + 1));
    const unique = [...new Set(tagEntries.map(e => e.amount))];
    unique.sort((a, b) => {
      const freqDiff = (freq.get(b) || 0) - (freq.get(a) || 0);
      if (freqDiff !== 0) return freqDiff;
      const lastA = tagEntries.filter(e => e.amount === a).sort((x, y) => y.date.localeCompare(x.date))[0]?.date || '';
      const lastB = tagEntries.filter(e => e.amount === b).sort((x, y) => y.date.localeCompare(x.date))[0]?.date || '';
      return lastB.localeCompare(lastA);
    });
    return unique.slice(0, 5);
  }, [entries, tag, kind, editId]);

  if (!suggestions.length) return null;

  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginTop: 12, scrollbarWidth: 'none' }}>
      {suggestions.map(val => (
        <button key={val} onClick={() => onPick(val)} style={{
          background: T.surface2, border: `1px solid ${T.border}`,
          borderRadius: 100, padding: '5px 14px', flexShrink: 0,
          fontSize: 12, fontWeight: 500, color: T.sub,
          fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
          letterSpacing: '0.02em', whiteSpace: 'nowrap',
        }}
          onMouseEnter={ev => { ev.currentTarget.style.borderColor = T.sub; ev.currentTarget.style.color = T.text; }}
          onMouseLeave={ev => { ev.currentTarget.style.borderColor = T.border; ev.currentTarget.style.color = T.sub; }}
        >
          ₦{val.toLocaleString()}
        </button>
      ))}
    </div>
  );
}
