'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getIcon } from '@/lib/constants';
import type { Currency } from '@/lib/types';
import RateRow from './RateRow';

export default function SettingsPage() {
  const {
    T, dark, setDark,
    displayCurrency, setDisplayCurrency,
    rates, setRates, ratesDate,
    expenseTags, incomeTags, addTag, removeTag, renameTag,
    clearAllEntries,
  } = useApp();

  const [newExpTag,    setNewExpTag]    = useState('');
  const [newIncTag,    setNewIncTag]    = useState('');
  const [editingTag,   setEditingTag]   = useState<{ kind: 'expense' | 'income'; name: string } | null>(null);
  const [editVal,      setEditVal]      = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTag) setTimeout(() => editInputRef.current?.focus(), 30);
  }, [editingTag]);

  function startEdit(kind: 'expense' | 'income', name: string) { setEditingTag({ kind, name }); setEditVal(name); }
  function cancelEdit() { setEditingTag(null); setEditVal(''); }
  function commitEdit() {
    if (!editingTag || !editVal.trim()) return;
    renameTag(editingTag.kind, editingTag.name, editVal);
    setEditingTag(null);
    setEditVal('');
  }
  function handleAdd(kind: 'expense' | 'income', val: string, setter: (v: string) => void) {
    const t = val.trim();
    if (!t) return;
    const list = kind === 'expense' ? expenseTags : incomeTags;
    if (list.map(x => x.toLowerCase()).includes(t.toLowerCase())) return;
    addTag(kind, t);
    setter('');
  }

  const sl: React.CSSProperties = { fontSize: 12, letterSpacing: '0.18em', color: T.muted, textTransform: 'uppercase', marginBottom: 14 };
  const inpBase: React.CSSProperties = { flex: 1, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'inherit', color: T.text, outline: 'none' };

  function renderTagList(
    kind: 'expense' | 'income',
    tags: string[],
    accentColor: string,
    newVal: string,
    setNew: (v: string) => void,
  ) {
    return (
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px', marginBottom: 20 }}>
        <div style={sl}>{kind === 'expense' ? 'Expense' : 'Income'} Categories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {tags.map(t => {
            const Icon = getIcon(t);
            const isEditing = editingTag?.kind === kind && editingTag?.name === t;
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: T.surface2, borderRadius: 9 }}>
                <Icon size={14} color={accentColor} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {isEditing ? (
                  <>
                    <input
                      ref={editInputRef}
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      style={{ ...inpBase, flex: 1, padding: '5px 10px', fontSize: 12, borderColor: accentColor }}
                    />
                    <button onClick={commitEdit} style={{ background: 'none', border: 'none', color: T.green, cursor: 'pointer', padding: '2px 4px', display: 'flex' }}>
                      <Check size={14} />
                    </button>
                    <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: '2px 4px', display: 'flex' }}>
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 12, color: T.text }}>{t}</span>
                    <button onClick={() => startEdit(kind, t)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: '2px 4px', display: 'flex', transition: 'color 0.15s' }}
                      onMouseEnter={ev => (ev.currentTarget.style.color = T.text)}
                      onMouseLeave={ev => (ev.currentTarget.style.color = T.muted)}
                    ><Pencil size={13} /></button>
                    <button onClick={() => removeTag(kind, t)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: '2px 4px', display: 'flex', transition: 'color 0.15s' }}
                      onMouseEnter={ev => (ev.currentTarget.style.color = T.red)}
                      onMouseLeave={ev => (ev.currentTarget.style.color = T.muted)}
                    ><X size={13} /></button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newVal}
            onChange={e => setNew(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd(kind, newVal, setNew)}
            placeholder={`New ${kind} category`}
            style={inpBase}
          />
          <button onClick={() => handleAdd(kind, newVal, setNew)} style={{
            background: accentColor, color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}><Plus size={15} /></button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: '32px 20px 100px', animation: 'rise 0.3s ease' }}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: T.text, marginBottom: 6, fontWeight: 400 }}>Settings</div>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 32 }}>Customise your Ledger</div>

      {/* Appearance */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px', marginBottom: 20 }}>
        <div style={sl}>Appearance</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>Night mode</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Dark background, easier on the eyes</div>
          </div>
          <button onClick={() => setDark(!dark)} style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', background: dark ? T.green : T.border, position: 'relative', transition: 'background 0.25s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'left 0.25s', left: dark ? 23 : 3, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
      </div>

      {/* Display Currency */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px', marginBottom: 20 }}>
        <div style={sl}>Display Currency</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['NGN', 'USD', 'EUR'] as Currency[]).map(cur => (
            <button key={cur} onClick={() => setDisplayCurrency(cur)} style={{
              flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
              background: displayCurrency === cur ? T.text : T.surface2,
              color: displayCurrency === cur ? T.bg : T.sub,
              border: `1px solid ${displayCurrency === cur ? T.text : T.border}`,
            }}>
              {cur === 'NGN' ? '₦ NGN' : cur === 'USD' ? '$ USD' : '€ EUR'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <RateRow label="1 USD =" value={rates.USD} onSave={val => setRates({ ...rates, USD: val })} />
          <RateRow label="1 EUR =" value={rates.EUR} onSave={val => setRates({ ...rates, EUR: val })} />
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
            {ratesDate ? `API rate fetched ${ratesDate} · tap pencil to override` : 'No live rate — tap pencil to set manually'}
          </div>
        </div>
      </div>

      {renderTagList('expense', expenseTags, T.red,   newExpTag, setNewExpTag)}
      {renderTagList('income',  incomeTags,  T.green, newIncTag, setNewIncTag)}

      {/* Danger zone */}
      <div style={{ background: T.surface, border: `1px solid ${clearConfirm ? T.red : T.border}`, borderRadius: 14, padding: '20px', transition: 'border 0.2s' }}>
        <div style={sl}>Danger Zone</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>Clear all records</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
              {clearConfirm ? 'Are you sure? This cannot be undone.' : 'Wipe all transactions. Clean slate.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {clearConfirm && (
              <button onClick={() => setClearConfirm(false)} style={{ fontFamily: 'inherit', fontSize: 12, fontWeight: 500, background: T.surface2, color: T.sub, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
            <button onClick={() => {
              if (!clearConfirm) { setClearConfirm(true); }
              else { clearAllEntries(); setClearConfirm(false); }
            }} style={{ fontFamily: 'inherit', fontSize: 12, fontWeight: 600, background: clearConfirm ? T.red : T.surface2, color: clearConfirm ? '#fff' : T.red, border: `1px solid ${clearConfirm ? T.red : T.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s' }}>
              {clearConfirm ? 'Yes, clear all' : 'Clear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
