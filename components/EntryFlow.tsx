'use client';

import { useState } from 'react';
import { X, Check, TrendingDown, TrendingUp, Pencil } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { nowDay } from '@/lib/dates';
import type { Entry, Currency } from '@/lib/types';
import CompactDate from './CompactDate';
import TagButtonGrid from './TagButtonGrid';
import NoteAutocomplete from './NoteAutocomplete';
import PersonAutocomplete from './PersonAutocomplete';
import AmountSuggestions from './AmountSuggestions';
import QuickSuggest from './QuickSuggest';

interface Props {
  editEntry?: Entry | null;
  onSave: (data: Omit<Entry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

export default function EntryFlow({ editEntry, onSave, onClose }: Props) {
  const { T, dark, entries, expenseTags, incomeTags, rates, addTag } = useApp();

  const [step,          setStep]          = useState(editEntry ? 1 : 0);
  const [kind,          setKind]          = useState<'expense' | 'income'>(editEntry?.kind || 'expense');
  const [amount,        setAmount]        = useState(editEntry ? String(editEntry.amount) : '');
  const [entryCurrency, setEntryCurrency] = useState<Currency>('NGN');
  const [tag,           setTag]           = useState(editEntry?.tag    || '');
  const [note,          setNote]          = useState(editEntry?.note   || '');
  const [person,        setPerson]        = useState(editEntry?.person || '');
  const [date,          setDate]          = useState(editEntry?.date   || nowDay());

  const toNGN = (val: string) => {
    const n = parseFloat(val);
    if (!n || n <= 0) return 0;
    if (entryCurrency === 'USD') return Math.round(n * rates.USD);
    if (entryCurrency === 'EUR') return Math.round(n * rates.EUR);
    return n;
  };

  const ngnPreview = entryCurrency !== 'NGN' && parseFloat(amount) > 0
    ? `≈ ₦${Math.round(parseFloat(amount) * rates[entryCurrency]).toLocaleString('en-NG')}`
    : null;

  const tags = kind === 'expense' ? expenseTags : incomeTags;
  const kindColor = kind === 'income' ? T.green : T.red;
  const curSymbol = entryCurrency === 'USD' ? '$' : entryCurrency === 'EUR' ? '€' : '₦';

  function selectKind(k: 'expense' | 'income') {
    setKind(k);
    const newTags = k === 'expense' ? expenseTags : incomeTags;
    if (tag && !newTags.includes(tag)) setTag('');
    setStep(1);
  }

  function confirmAmount() {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    setStep(2);
  }

  function selectTag(t: string) { setTag(t); setStep(3); }
  function confirmNote() { setStep(4); }

  function handleSave(overridePerson?: string) {
    const ngn = toNGN(amount);
    if (!ngn || !tag) return;
    onSave({
      date, kind, tag,
      note: note.trim(),
      person: (overridePerson ?? person).trim(),
      amount: ngn,
      original_amount: parseFloat(amount),
      original_currency: entryCurrency,
    });
  }

  const summaries = [
    { step: 0, label: kind === 'income' ? 'Income' : 'Expense', color: kindColor },
    { step: 1, label: amount ? `${curSymbol}${parseFloat(amount).toLocaleString()}` : null, color: T.text },
    { step: 2, label: tag || null, color: kindColor },
    { step: 3, label: note || null, color: T.sub },
  ];

  function StepBadge({ s }: { s: number }) {
    const sm = summaries[s];
    if (!sm.label || step <= s) return null;
    return (
      <button onClick={() => setStep(s)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: T.surface2, border: `1px solid ${T.border}`,
        borderRadius: 100, padding: '5px 12px', fontSize: 12,
        color: sm.color, fontFamily: 'inherit', cursor: 'pointer',
        marginRight: 6, marginBottom: 6,
      }}>
        {s === 0 ? (kind === 'income' ? <TrendingUp size={11} /> : <TrendingDown size={11} />) : null}
        {sm.label}
        <Pencil size={10} color={T.muted} />
      </button>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} />

      <div style={{
        position: 'fixed', top: '8%', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 201,
        width: 'min(420px, calc(100vw - 32px))',
        maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        borderRadius: 20,
        background: dark ? 'rgba(28,28,28,0.72)' : 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.7)',
        boxShadow: dark
          ? '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 24px 60px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
        animation: 'glassIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={onClose} style={{
              background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              border: 'none', borderRadius: '50%', width: 30, height: 30,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.muted,
            }}>
              <X size={15} />
            </button>
          </div>

          {step > 0 && (
            <div style={{ marginBottom: 16 }}>
              {[0, 1, 2, 3].map(s => <StepBadge key={s} s={s} />)}
            </div>
          )}

          {/* Step 0: Kind */}
          {step === 0 && (
            <div style={{ animation: 'rise 0.2s ease' }}>
              <div style={{ fontSize: 12, letterSpacing: '0.18em', color: T.muted, textTransform: 'uppercase', marginBottom: 20 }}>What is this?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([['expense', TrendingDown, 'Expense', T.red], ['income', TrendingUp, 'Income', T.green]] as const).map(([k, Icon, label, col]) => (
                  <button key={k} onClick={() => selectKind(k)} style={{
                    padding: '28px 16px', border: `2px solid ${T.border}`, borderRadius: 16,
                    background: T.surface2, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                  }}
                    onMouseEnter={ev => { ev.currentTarget.style.borderColor = col; ev.currentTarget.style.background = `${col}11`; }}
                    onMouseLeave={ev => { ev.currentTarget.style.borderColor = T.border; ev.currentTarget.style.background = T.surface2; }}
                  >
                    <Icon size={28} color={col} strokeWidth={1.5} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: col }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Amount */}
          {step === 1 && (
            <div style={{ animation: 'rise 0.2s ease', paddingBottom: 8 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.18em', color: T.muted, textTransform: 'uppercase', marginBottom: 16 }}>How much?</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                {(['NGN', 'USD', 'EUR'] as Currency[]).map(cur => (
                  <button key={cur} onClick={() => setEntryCurrency(cur)} style={{
                    padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                    fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                    background: entryCurrency === cur ? kindColor : T.surface2,
                    color: entryCurrency === cur ? '#fff' : T.muted,
                    border: `1px solid ${entryCurrency === cur ? kindColor : T.border}`,
                  }}>{cur}</button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: T.muted, marginRight: 4, marginTop: 8 }}>{curSymbol}</span>
                  <input
                    autoFocus
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmAmount()}
                    style={{
                      fontFamily: "'DM Serif Display', serif", fontSize: 56, border: 'none',
                      background: 'transparent', color: T.text, width: 220,
                      textAlign: 'center', caretColor: kindColor, outline: 'none',
                    }}
                  />
                </div>
                <div style={{ height: 1.5, background: `linear-gradient(90deg, transparent, ${kindColor}66, transparent)`, margin: '4px auto 0', width: 220 }} />
                {ngnPreview && <div style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>{ngnPreview}</div>}
              </div>
              <CompactDate date={date} onChange={setDate} kindColor={kindColor} />
              <AmountSuggestions entries={entries} tag={tag} kind={kind} editId={editEntry?.id}
                onPick={val => { setAmount(String(val)); setEntryCurrency('NGN'); }}
              />
            </div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <div style={{ animation: 'rise 0.2s ease' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: T.text, marginBottom: 20, fontWeight: 400 }}>
                Which category?
              </div>
              <TagButtonGrid tags={tags} tag={tag} kindColor={kindColor} kind={kind} onSelect={selectTag} onAddTag={addTag} />
            </div>
          )}

          {/* Step 3: Note */}
          {step === 3 && (
            <div style={{ animation: 'rise 0.2s ease' }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: T.text, marginBottom: 20, fontWeight: 400 }}>
                {kind === 'income' ? 'What was it for?' : 'What did you spend on?'}
              </div>
              <NoteAutocomplete note={note} entries={entries} editId={editEntry?.id}
                onChange={val => setNote(val)}
                onSelect={match => { setNote(match.note); if (match.person) setPerson(match.person); }}
                onEnter={confirmNote}
              />
              <QuickSuggest
                entries={entries} field="note"
                filter={e => e.kind === kind && e.tag === tag}
                onPick={val => { setNote(val); confirmNote(); }}
              />
            </div>
          )}

          {/* Step 4: Person */}
          {step === 4 && (
            <div style={{ animation: 'rise 0.2s ease', paddingBottom: 8 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: T.text, marginBottom: 4, fontWeight: 400 }}>
                {kind === 'income' ? 'Who sent it?' : 'Who did you send to?'}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>Tap to select — saves immediately</div>
              <PersonAutocomplete person={person} entries={entries} kind={kind} editId={editEntry?.id}
                onChange={val => setPerson(val)}
                onEnter={() => handleSave()}
              />
              <QuickSuggest
                entries={entries} field="person"
                filter={e => e.kind === kind}
                onPick={val => handleSave(val)}
              />
            </div>
          )}
        </div>

        {/* Sticky footer */}
        {(step === 1 || step === 3 || step === 4) && (
          <div style={{ flexShrink: 0, padding: '12px 24px 20px', borderTop: `1px solid ${T.border}` }}>
            {step === 4 ? (
              <button onClick={() => handleSave()} style={{
                width: '100%', padding: '14px 0', background: kindColor, color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '0.04em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Check size={16} /> Save without recipient
              </button>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={step === 1 ? confirmAmount : confirmNote}
                  style={{
                    width: 56, height: 56, borderRadius: '50%', background: kindColor,
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 20px ${kindColor}55`, transition: 'transform 0.15s',
                  }}
                  onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}
                >
                  <Check size={22} color="#fff" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
