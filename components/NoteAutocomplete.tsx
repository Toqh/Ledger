'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getIcon } from '@/lib/constants';
import type { Entry } from '@/lib/types';

interface Props {
  note: string;
  entries: Entry[];
  editId?: string;
  onChange: (val: string) => void;
  onSelect: (match: Entry) => void;
  onEnter: () => void;
}

export default function NoteAutocomplete({ note, entries, editId, onChange, onSelect, onEnter }: Props) {
  const { T } = useApp();
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const history = useMemo(() => {
    const seen = new Map<string, Entry>();
    [...entries]
      .filter(e => e.note && e.id !== editId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach(e => {
        const key = e.note.toLowerCase().trim();
        if (!seen.has(key)) seen.set(key, e);
      });
    return [...seen.values()];
  }, [entries, editId]);

  const suggestions = useMemo(() => {
    if (!note.trim()) return [];
    const q = note.toLowerCase();
    return history.filter(e => e.note.toLowerCase().includes(q)).slice(0, 5);
  }, [note, history]);

  const showDrop = focused && suggestions.length > 0;

  function pick(entry: Entry) { onSelect(entry); setFocused(false); setCursor(-1); }

  function handleKey(e: React.KeyboardEvent) {
    if (!showDrop) { if (e.key === 'Enter') onEnter(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); cursor >= 0 ? pick(suggestions[cursor]) : onEnter(); }
    else if (e.key === 'Escape') { setFocused(false); setCursor(-1); }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', marginBottom: 8 }}>
      <input
        type="text"
        placeholder="Notes / description (optional)"
        value={note}
        onChange={e => { onChange(e.target.value); setCursor(-1); }}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKey}
        style={{
          width: '100%', background: T.surface2,
          border: `1px solid ${showDrop ? T.sub : T.border}`,
          borderRadius: showDrop ? '10px 10px 0 0' : 10,
          padding: '12px 16px', fontSize: 14,
          fontFamily: 'inherit', color: T.text,
          outline: 'none', transition: 'border 0.15s, border-radius 0.15s',
        }}
      />
      {showDrop && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: T.surface, border: `1px solid ${T.sub}`, borderTop: 'none',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {suggestions.map((e, i) => {
            const TagIcon = getIcon(e.tag);
            const isActive = cursor === i;
            return (
              <div key={e.id} onMouseDown={() => pick(e)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', cursor: 'pointer',
                background: isActive ? T.surface2 : 'transparent',
                borderBottom: i < suggestions.length - 1 ? `1px solid ${T.border}` : 'none',
                transition: 'background 0.1s',
              }}
                onMouseEnter={() => setCursor(i)}
                onMouseLeave={() => setCursor(-1)}
              >
                <TagIcon size={13} color={e.kind === 'income' ? T.green : T.red} strokeWidth={1.8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {e.note}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>
                    {e.tag} · {e.kind === 'income' ? '+' : '−'}₦{e.amount.toLocaleString()}
                    {e.person && <span> · {e.kind === 'income' ? 'from' : 'to'} {e.person}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>{e.date}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
