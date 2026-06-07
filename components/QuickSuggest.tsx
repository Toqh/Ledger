'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { Entry } from '@/lib/types';

interface Props {
  entries: Entry[];
  field: 'note' | 'person';
  filter: (e: Entry) => boolean;
  onPick: (val: string) => void;
}

export default function QuickSuggest({ entries, field, filter, onPick }: Props) {
  const { T } = useApp();

  const suggestions = useMemo(() => {
    const filtered = entries.filter(e => filter(e) && e[field] && e[field].trim());
    if (!filtered.length) return [];

    const freq = new Map<string, number>();
    const latest = new Map<string, number>();
    filtered.forEach(e => {
      const val = e[field].trim();
      freq.set(val, (freq.get(val) || 0) + 1);
      const t = new Date(e.date).getTime();
      if (!latest.has(val) || t > latest.get(val)!) latest.set(val, t);
    });

    const dates = [...latest.values()];
    const minT = Math.min(...dates), maxT = Math.max(...dates);
    const range = maxT - minT || 1;
    const maxFreq = Math.max(...freq.values());

    return [...freq.keys()]
      .map(val => {
        const freqScore    = (freq.get(val) || 0) / maxFreq;
        const recencyScore = ((latest.get(val) || 0) - minT) / range;
        return { val, score: freqScore * 0.5 + recencyScore * 0.5 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(x => x.val);
  }, [entries, field]);

  if (!suggestions.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
      {suggestions.map(val => (
        <button key={val} onClick={() => onPick(val)} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', borderRadius: 10,
          border: `1px solid ${T.border}`,
          background: T.surface2,
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 12, color: T.text, textAlign: 'left',
          transition: 'all 0.12s',
        }}
          onMouseEnter={ev => { ev.currentTarget.style.borderColor = T.sub; ev.currentTarget.style.background = T.surface; }}
          onMouseLeave={ev => { ev.currentTarget.style.borderColor = T.border; ev.currentTarget.style.background = T.surface2; }}
        >
          <ChevronRight size={13} color={T.muted} />
          {val}
        </button>
      ))}
    </div>
  );
}
