'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getIcon } from '@/lib/constants';
import { MONTHS } from '@/lib/constants';
import { nowMo, toMo, prevMo } from '@/lib/dates';
import type { Entry } from '@/lib/types';
import DailySparkline from './DailySparkline';
import DrillDownAccordion from './DrillDownAccordion';
import EntryFlow from './EntryFlow';

export default function ReportPage() {
  const { T, dark, entries, fmt, updateEntry, setPendingDelete } = useApp();
  const [month,     setMonth]     = useState(nowMo());
  const [editEntry, setEditEntry] = useState<Entry | null>(null);

  const prev = prevMo(month);

  function monthData(m: string) {
    const rows = entries.filter(e => toMo(e.date) === m);
    const inc  = rows.filter(e => e.kind === 'income').reduce((s, e) => s + e.amount, 0);
    const exp  = rows.filter(e => e.kind === 'expense').reduce((s, e) => s + e.amount, 0);
    return { rows, inc, exp, net: inc - exp };
  }

  const curr = monthData(month);
  const last = monthData(prev);

  const openingBalance = entries
    .filter(e => toMo(e.date) < month)
    .reduce((s, e) => e.kind === 'income' ? s + e.amount : s - e.amount, 0);

  const closingBalance = openingBalance + curr.net;

  const months = [...new Set(entries.map(e => toMo(e.date)))].sort().reverse();
  const [yr, mo] = month.split('-');
  const label = `${MONTHS[parseInt(mo) - 1]} ${yr}`;

  function Delta({ curr: c, prev: p, invert }: { curr: number; prev: number | null; invert: boolean }) {
    if (p === null) return null;
    const diff = c - p;
    const pct  = p > 0 ? Math.round(Math.abs(diff) / p * 100) : null;
    const up   = diff > 0;
    const good = invert ? !up : up;
    if (diff === 0) return <span style={{ fontSize: 12, color: T.muted, display: 'flex', alignItems: 'center', gap: 2 }}><Minus size={9} /> same as last month</span>;
    return (
      <span style={{ fontSize: 12, color: good ? T.green : T.red, display: 'flex', alignItems: 'center', gap: 2, marginTop: 4 }}>
        {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {pct !== null ? `${pct}%` : fmt(Math.abs(diff))} vs last month
      </span>
    );
  }

  async function handleSave(data: Omit<Entry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (editEntry) await updateEntry({ ...editEntry, ...data });
    setEditEntry(null);
  }

  function exportCSV() {
    if (!curr.rows.length) return;
    const headers = ['Date','Kind','Category','Details','Person','Amount'];
    const rows = [...curr.rows]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => [e.date, e.kind, e.tag, e.note || '', e.person || '', e.amount].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `ledger-${month}.csv`;
    a.click();
  }

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 20px 80px', animation: 'rise 0.3s ease' }}>

      {/* Controls */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <select value={month} onChange={e => setMonth(e.target.value)} style={{
          fontFamily: 'inherit', fontSize: 12, background: T.surface2,
          border: `1px solid ${T.border}`, borderRadius: 8, padding: '9px 14px',
          color: T.text, cursor: 'pointer',
        }}>
          {months.map(m => {
            const [y, mm] = m.split('-');
            return <option key={m} value={m} style={{ background: dark ? '#1c1c1c' : '#fff' }}>{MONTHS[parseInt(mm) - 1]} {y}</option>;
          })}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()} style={{
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            background: T.text, color: T.bg, border: 'none',
            borderRadius: 8, padding: '9px 18px', cursor: 'pointer', letterSpacing: '0.04em',
          }}>Print / PDF</button>
          <button onClick={exportCSV} style={{
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            background: 'transparent', color: T.sub,
            border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '9px 18px', cursor: 'pointer', letterSpacing: '0.04em',
          }}>Export CSV</button>
        </div>
      </div>

      <div style={{ background: T.surface, borderRadius: 16, padding: '32px 28px', border: `1px solid ${T.border}` }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.2em', color: T.muted, marginBottom: 4, textTransform: 'uppercase' }}>Monthly Report</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: T.text, fontWeight: 400 }}>{label}</h2>
        </div>

        {/* Opening / Closing balance */}
        {openingBalance !== 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.surface2, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: '0.14em', color: T.muted, textTransform: 'uppercase', marginBottom: 3 }}>Opening Balance</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: openingBalance >= 0 ? T.green : T.red }}>
                {openingBalance >= 0 ? '+' : '−'}{fmt(openingBalance)}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>carried from previous months</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, letterSpacing: '0.14em', color: T.muted, textTransform: 'uppercase', marginBottom: 3 }}>Closing Balance</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: closingBalance >= 0 ? T.green : T.red }}>
                {closingBalance >= 0 ? '+' : '−'}{fmt(closingBalance)}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>end of {label}</div>
            </div>
          </div>
        )}

        {/* Totals grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Income',  value: curr.inc, prev: last.inc, color: T.green, Icon: TrendingUp,   invert: false },
            { label: 'Expense', value: curr.exp, prev: last.exp, color: T.red,   Icon: TrendingDown, invert: true  },
            { label: 'Net',     value: Math.abs(curr.net), prev: null, color: curr.net >= 0 ? T.green : T.red, Icon: curr.net >= 0 ? TrendingUp : TrendingDown, invert: false },
          ].map(c => (
            <div key={c.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <c.Icon size={10} color={T.muted} />
                <span style={{ fontSize: 12, letterSpacing: '0.16em', color: T.muted, textTransform: 'uppercase' }}>{c.label}</span>
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: c.color }}>{fmt(c.value)}</div>
              <Delta curr={c.value} prev={c.prev} invert={c.invert} />
              {c.label === 'Net' && curr.inc > 0 && (
                <div style={{ fontSize: 12, color: curr.net >= 0 ? T.green : T.red, marginTop: 4, fontWeight: 600 }}>
                  {Math.round((curr.net / curr.inc) * 100)}% saved
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Split bar */}
        {(curr.inc + curr.exp) > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 6, background: T.surface2 }}>
              <div style={{ width: `${(curr.inc / (curr.inc + curr.exp)) * 100}%`, background: T.green, transition: 'width 0.5s ease' }} />
              <div style={{ flex: 1, background: T.red }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 12, color: T.muted }}>
              <span>Income {Math.round(curr.inc / (curr.inc + curr.exp) * 100)}%</span>
              <span>Expense {Math.round(curr.exp / (curr.inc + curr.exp) * 100)}%</span>
            </div>
          </div>
        )}

        <DailySparkline rows={curr.rows} month={month} />

        <DrillDownAccordion
          displayRows={curr.rows}
          onEdit={setEditEntry}
          onDelete={e => setPendingDelete(e)}
        />

        {/* All transactions */}
        {curr.rows.length > 0 && (
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24, marginTop: 8 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.18em', color: T.muted, marginBottom: 14, textTransform: 'uppercase' }}>
              All Transactions
            </div>
            {[...curr.rows].sort((a, b) => b.date.localeCompare(a.date)).map(e => {
              const Icon = getIcon(e.tag);
              return (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <Icon size={13} color={e.kind === 'income' ? T.green : T.red} strokeWidth={1.8} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.tag}{e.note ? <span style={{ color: T.sub }}> · {e.note}</span> : ''}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted }}>
                        {e.date}{e.person && <span style={{ color: T.sub }}> · {e.kind === 'income' ? 'from' : 'to'} {e.person}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: e.kind === 'income' ? T.green : T.red }}>
                      {e.kind === 'income' ? '+' : '−'}{fmt(e.amount)}
                    </div>
                    <button onClick={() => setEditEntry(e)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, padding: '0 3px', transition: 'color 0.15s' }}
                      onMouseEnter={ev => (ev.currentTarget.style.color = T.text)}
                      onMouseLeave={ev => (ev.currentTarget.style.color = T.muted)}
                    >edit</button>
                    <button onClick={() => setPendingDelete(e)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: '0 2px', display: 'flex', transition: 'color 0.15s' }}
                      onMouseEnter={ev => (ev.currentTarget.style.color = T.red)}
                      onMouseLeave={ev => (ev.currentTarget.style.color = T.muted)}
                    ><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {curr.rows.length === 0 && (
          <div style={{ textAlign: 'center', color: T.muted, fontSize: 12, padding: '24px 0' }}>
            No transactions for {label}.
          </div>
        )}

        <div style={{ marginTop: 24, fontSize: 12, color: T.muted, textAlign: 'center', letterSpacing: '0.08em' }}>
          LEDGER · {label} · {curr.rows.length} transaction{curr.rows.length !== 1 ? 's' : ''}
        </div>
      </div>

      {editEntry && (
        <EntryFlow
          editEntry={editEntry}
          onSave={handleSave}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  );
}
