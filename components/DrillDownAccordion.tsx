'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getIcon } from '@/lib/constants';
import type { Entry } from '@/lib/types';

interface Props {
  displayRows: Entry[];
  onEdit: (e: Entry) => void;
  onDelete: (e: Entry) => void;
}

export default function DrillDownAccordion({ displayRows, onEdit, onDelete }: Props) {
  const { T, fmt, incomeTags, expenseTags } = useApp();
  const [openCat,  setOpenCat]  = useState<string | null>(null);
  const [openNote, setOpenNote] = useState<string | null>(null);

  if (!displayRows.length) {
    return <div style={{ textAlign: 'center', color: T.muted, fontSize: 12, padding: '24px 0' }}>No entries.</div>;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {(['income', 'expense'] as const).map(kind => {
        const isIncome = kind === 'income';
        const tags = isIncome ? incomeTags : expenseTags;
        const col  = isIncome ? T.green : T.red;
        const kindRows = displayRows.filter(e => e.kind === kind);
        if (!kindRows.length) return null;
        const kindTotal = kindRows.reduce((s, e) => s + e.amount, 0);

        const catGroups = tags
          .map(tag => ({ tag, rows: kindRows.filter(e => e.tag === tag) }))
          .filter(g => g.rows.length > 0);

        return (
          <div key={kind} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.18em', color: col, marginBottom: 10, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
              {isIncome ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {isIncome ? 'Income' : 'Expenses'}
            </div>

            {catGroups.map(({ tag, rows }) => {
              const catTotal = rows.reduce((s, e) => s + e.amount, 0);
              const pct = kindTotal > 0 ? (catTotal / kindTotal) * 100 : 0;
              const Icon = getIcon(tag);
              const catKey = `${kind}:${tag}`;
              const catOpen = openCat === catKey;

              const noteGroups = [...new Set(rows.map(e => e.note || '—'))].map(note => ({
                note, rows: rows.filter(e => (e.note || '—') === note),
              }));

              return (
                <div key={tag} style={{ marginBottom: 6, border: `1px solid ${catOpen ? col + '44' : T.border}`, borderRadius: 10, overflow: 'hidden', transition: 'border 0.2s' }}>
                  <button onClick={() => { setOpenCat(catOpen ? null : catKey); setOpenNote(null); }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', background: catOpen ? `${col}08` : 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}>
                    <Icon size={14} color={col} strokeWidth={1.8} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{tag}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{fmt(catTotal)}</span>
                      </div>
                      <div style={{ background: T.surface2, borderRadius: 3, height: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: col, height: '100%', borderRadius: 3, opacity: 0.7 }} />
                      </div>
                    </div>
                    <ChevronDown size={13} color={T.muted} style={{ transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </button>

                  {catOpen && (
                    <div style={{ borderTop: `1px solid ${T.border}` }}>
                      {noteGroups.map(({ note, rows: nRows }) => {
                        const noteKey  = `${kind}:${tag}:${note}`;
                        const noteOpen = openNote === noteKey;
                        const noteTotal = nRows.reduce((s, e) => s + e.amount, 0);
                        return (
                          <div key={note} style={{ borderBottom: `1px solid ${T.border}` }}>
                            <button onClick={() => setOpenNote(noteOpen ? null : noteKey)} style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '9px 14px 9px 36px', background: noteOpen ? T.surface2 : 'transparent',
                              border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                            }}>
                              <ChevronRight size={11} color={T.muted} style={{ transform: noteOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                              <span style={{ flex: 1, fontSize: 12, color: T.sub }}>{note}</span>
                              <span style={{ fontSize: 12, color: T.muted }}>{nRows.length}×</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: col, marginLeft: 8 }}>{fmt(noteTotal)}</span>
                            </button>

                            {noteOpen && nRows.map(e => (
                              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 14px 7px 50px', background: T.surface2, borderTop: `1px solid ${T.border}` }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 12, color: T.text }}>{e.date}</div>
                                  {e.person && <div style={{ fontSize: 12, color: T.muted }}>{isIncome ? 'from' : 'to'} {e.person}</div>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: col }}>{fmt(e.amount)}</div>
                                  <button onClick={() => onEdit(e)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, padding: '0 2px', transition: 'color 0.15s' }}
                                    onMouseEnter={ev => (ev.currentTarget.style.color = T.text)}
                                    onMouseLeave={ev => (ev.currentTarget.style.color = T.muted)}
                                  >edit</button>
                                  <button onClick={() => onDelete(e)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: '0 1px', display: 'flex', transition: 'color 0.15s' }}
                                    onMouseEnter={ev => (ev.currentTarget.style.color = T.red)}
                                    onMouseLeave={ev => (ev.currentTarget.style.color = T.muted)}
                                  ><Trash2 size={11} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
