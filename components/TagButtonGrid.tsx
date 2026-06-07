'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getIcon } from '@/lib/constants';

interface Props {
  tags: string[];
  tag: string;
  kindColor: string;
  kind: 'expense' | 'income';
  onSelect: (t: string) => void;
  onAddTag: (kind: 'expense' | 'income', name: string) => void;
}

export default function TagButtonGrid({ tags, tag, kindColor, kind, onSelect, onAddTag }: Props) {
  const { T } = useApp();
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) setTimeout(() => newInputRef.current?.focus(), 30);
  }, [adding]);

  const filtered = search.trim()
    ? tags.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    : tags;

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    if (!tags.map(t => t.toLowerCase()).includes(name.toLowerCase())) {
      onAddTag(kind, name);
      onSelect(name);
    }
    setAdding(false);
    setNewName('');
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
        <Search size={14} color={T.muted} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search categories…"
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: T.text, fontFamily: 'inherit', flex: 1 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={12} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && !adding
          ? <div style={{ textAlign: 'center', color: T.muted, fontSize: 12, padding: '16px 0' }}>No match</div>
          : filtered.map(t => {
              const Icon = getIcon(t);
              const sel = t === tag;
              return (
                <button key={t} onClick={() => onSelect(t)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', borderRadius: 12,
                  border: `2px solid ${sel ? kindColor : T.border}`,
                  background: sel ? `${kindColor}12` : T.surface2,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s', textAlign: 'left',
                }}
                  onMouseEnter={ev => { if (!sel) { ev.currentTarget.style.borderColor = kindColor + '66'; ev.currentTarget.style.background = T.surface; } }}
                  onMouseLeave={ev => { if (!sel) { ev.currentTarget.style.borderColor = T.border; ev.currentTarget.style.background = T.surface2; } }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? `${kindColor}22` : T.surface, flexShrink: 0 }}>
                    <Icon size={17} color={sel ? kindColor : T.muted} strokeWidth={1.8} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? kindColor : T.text }}>{t}</span>
                  {sel && <Check size={15} color={kindColor} style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })
        }

        {adding ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={newInputRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
              placeholder="New category name…"
              style={{
                flex: 1, background: T.surface2, border: `2px solid ${kindColor}`,
                borderRadius: 10, padding: '12px 14px', fontSize: 14,
                fontFamily: 'inherit', color: T.text, outline: 'none',
              }}
            />
            <button onClick={handleAdd} style={{ background: kindColor, border: 'none', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Check size={16} color="#fff" />
            </button>
            <button onClick={() => { setAdding(false); setNewName(''); }} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: T.muted }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 12,
            border: `2px dashed ${T.border}`,
            background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 14, color: T.muted, transition: 'all 0.15s',
          }}
            onMouseEnter={ev => { ev.currentTarget.style.borderColor = kindColor; ev.currentTarget.style.color = kindColor; }}
            onMouseLeave={ev => { ev.currentTarget.style.borderColor = T.border; ev.currentTarget.style.color = T.muted; }}
          >
            <Plus size={16} /> Add new category
          </button>
        )}
      </div>
    </div>
  );
}
