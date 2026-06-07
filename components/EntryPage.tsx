'use client';

import { useState, useRef } from 'react';
import { Plus, TrendingDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getIcon } from '@/lib/constants';
import { nowDay } from '@/lib/dates';
import type { Entry } from '@/lib/types';
import EntryFlow from './EntryFlow';
import EntryDetailCard from './EntryDetailCard';

export default function EntryPage() {
  const { T, entries, fmt, addEntry, updateEntry, setPendingDelete } = useApp();
  const [flowOpen,      setFlowOpen]      = useState(false);
  const [editEntry,     setEditEntry]     = useState<Entry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [blurred,       setBlurred]       = useState(true);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allIn  = entries.filter(e => e.kind === 'income').reduce((s, e) => s + e.amount, 0);
  const allOut = entries.filter(e => e.kind === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = allIn - allOut;
  const spentToday = entries
    .filter(e => e.kind === 'expense' && e.date === nowDay())
    .reduce((s, e) => s + e.amount, 0);

  function openAdd()   { setEditEntry(null); setFlowOpen(true); }
  function openEdit(e: Entry) { setEditEntry(e); setFlowOpen(true); }
  function closeFlow() { setFlowOpen(false); setEditEntry(null); }

  async function handleSave(data: Omit<Entry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (editEntry) {
      await updateEntry({ ...editEntry, ...data });
    } else {
      await addEntry(data);
    }
    closeFlow();
  }

  function toggleBlur() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setBlurred(b => {
      if (b) {
        blurTimer.current = setTimeout(() => setBlurred(true), 12000);
        return false;
      }
      return true;
    });
  }

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 20px 120px', animation: 'rise 0.3s ease' }}>

      {/* Sticky floating header */}
      <div className="no-print" style={{
        position: 'sticky', top: 52, zIndex: 30,
        background: T.bg, paddingTop: 20, paddingBottom: 12, marginBottom: 8,
      }}>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: T.text, color: T.bg,
          border: 'none', borderRadius: 12,
          padding: '11px 20px', marginBottom: 12,
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          transition: 'transform 0.15s',
        }}
          onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Entry
        </button>

        {/* Running balance */}
        <div onClick={toggleBlur} style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', cursor: 'pointer', userSelect: 'none',
        }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.16em', color: T.sub, textTransform: 'uppercase', marginBottom: 5, fontWeight: 700 }}>
              Running Balance
            </div>
            <div style={{
              fontFamily: "'DM Serif Display', serif", fontSize: 32,
              color: balance >= 0 ? T.green : T.red,
              filter: blurred ? 'blur(10px)' : 'none', transition: 'filter 0.3s ease',
            }}>
              {balance >= 0 ? '+' : '−'}{fmt(balance)}
            </div>
          </div>
          <div style={{ textAlign: 'right', filter: blurred ? 'blur(8px)' : 'none', transition: 'filter 0.3s ease' }}>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>
              <span style={{ color: T.green, fontWeight: 700 }}>+{fmt(allIn)}</span> in
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>
              <span style={{ color: T.red, fontWeight: 700 }}>−{fmt(allOut)}</span> out
            </div>
          </div>
        </div>

        {/* Spent today */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={14} color={T.red} strokeWidth={2} />
            <span style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>Spent today</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: spentToday > 0 ? T.red : T.muted }}>
            {spentToday > 0 ? `−${fmt(spentToday)}` : '—'}
          </span>
        </div>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', color: T.sub, marginBottom: 12, textTransform: 'uppercase', fontWeight: 700 }}>Recent</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entries.slice(0, 3).map(e => {
              const Icon = getIcon(e.tag);
              return (
                <div key={e.id} onClick={() => setSelectedEntry(e)} style={{
                  display: 'flex', alignItems: 'center', background: T.surface, borderRadius: 12,
                  padding: '13px 16px', gap: 12, border: `1px solid ${T.border}`,
                  animation: 'fadeIn 0.2s ease', cursor: 'pointer', transition: 'background 0.15s',
                }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = T.surface2)}
                  onMouseLeave={ev => (ev.currentTarget.style.background = T.surface)}
                >
                  <Icon size={16} color={e.kind === 'income' ? T.green : T.red} strokeWidth={2} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: T.text }}>
                      {e.tag}{e.note && <span style={{ color: T.sub, fontWeight: 400 }}> · {e.note}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                      {e.date}{e.person && <span style={{ color: T.sub }}> · {e.kind === 'income' ? 'from' : 'to'} {e.person}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: e.kind === 'income' ? T.green : T.red, whiteSpace: 'nowrap' }}>
                    {e.kind === 'income' ? '+' : '−'}{fmt(e.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 8, color: T.sub }}>No entries yet</div>
          <div style={{ fontSize: 13 }}>Tap "Add Entry" to record your first transaction.</div>
        </div>
      )}

      {selectedEntry && (
        <EntryDetailCard
          entry={selectedEntry}
          onEdit={() => { openEdit(selectedEntry); setSelectedEntry(null); }}
          onDelete={() => { setPendingDelete(selectedEntry); setSelectedEntry(null); }}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {flowOpen && (
        <EntryFlow
          editEntry={editEntry}
          onSave={handleSave}
          onClose={closeFlow}
        />
      )}
    </div>
  );
}
