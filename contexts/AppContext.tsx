'use client';

import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Entry, UserSettings, Currency, Rates, ThemeTokens } from '@/lib/types';
import { DARK, LIGHT } from '@/lib/theme';
import { DEFAULT_EXPENSE_TAGS, DEFAULT_INCOME_TAGS } from '@/lib/constants';
import { fmt } from '@/lib/fmt';

interface AppContextValue {
  // Theme
  T: ThemeTokens;
  dark: boolean;
  setDark: (dark: boolean) => void;

  // Currency
  displayCurrency: Currency;
  setDisplayCurrency: (cur: Currency) => void;
  rates: Rates;
  setRates: (rates: Rates) => void;
  ratesDate: string | null;
  fmt: (n: number) => string;

  // Tags
  expenseTags: string[];
  incomeTags: string[];
  addTag: (kind: 'expense' | 'income', name: string) => void;
  removeTag: (kind: 'expense' | 'income', name: string) => void;
  renameTag: (kind: 'expense' | 'income', oldName: string, newName: string) => void;

  // Entries
  entries: Entry[];
  loaded: boolean;
  addEntry: (data: Omit<Entry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEntry: (entry: Entry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearAllEntries: () => Promise<void>;

  // UI
  toast: string | null;
  flash: (msg: string) => void;
  pendingDelete: Entry | null;
  setPendingDelete: (entry: Entry | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [dark, setDarkState] = useState(true);
  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>('NGN');
  const [rates, setRatesState] = useState<Rates>({ USD: 1620, EUR: 1750 });
  const [ratesDate, setRatesDate] = useState<string | null>(null);
  const [expenseTags, setExpenseTags] = useState([...DEFAULT_EXPENSE_TAGS]);
  const [incomeTags, setIncomeTags] = useState([...DEFAULT_INCOME_TAGS]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const T = dark ? DARK : LIGHT;

  const fmtBound = useCallback((n: number) => fmt(n, displayCurrency, rates), [displayCurrency, rates]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  // ── Load data on mount ──────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        setDarkState(settings.dark_mode);
        setDisplayCurrencyState(settings.display_currency);
        setRatesState({ USD: settings.rate_usd, EUR: settings.rate_eur });
        setExpenseTags(settings.expense_tags);
        setIncomeTags(settings.income_tags);
      } else {
        await supabase.from('user_settings').insert({
          user_id: user.id,
          dark_mode: true,
          display_currency: 'NGN',
          rate_usd: 1620,
          rate_eur: 1750,
          expense_tags: DEFAULT_EXPENSE_TAGS,
          income_tags: DEFAULT_INCOME_TAGS,
        });
      }

      const { data: entriesData } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (entriesData) setEntries(entriesData as Entry[]);
      setLoaded(true);
    }

    load();

    fetch('https://open.er-api.com/v6/latest/NGN')
      .then(r => r.json())
      .then(data => {
        if (data?.rates) {
          setRatesState({
            USD: Math.round(1 / data.rates.USD),
            EUR: Math.round(1 / data.rates.EUR),
          });
          setRatesDate(
            new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
          );
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Settings sync ───────────────────────────────────────────────
  async function syncSettings(patch: Partial<{
    dark_mode: boolean;
    display_currency: Currency;
    rate_usd: number;
    rate_eur: number;
    expense_tags: string[];
    income_tags: string[];
  }>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      ...patch,
      updated_at: new Date().toISOString(),
    });
  }

  const setDark = useCallback((d: boolean) => {
    setDarkState(d);
    syncSettings({ dark_mode: d });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDisplayCurrency = useCallback((cur: Currency) => {
    setDisplayCurrencyState(cur);
    syncSettings({ display_currency: cur });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRates = useCallback((r: Rates) => {
    setRatesState(r);
    syncSettings({ rate_usd: r.USD, rate_eur: r.EUR });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTag = useCallback((kind: 'expense' | 'income', name: string) => {
    const t = name.trim();
    if (!t) return;
    if (kind === 'expense') {
      setExpenseTags(prev => {
        if (prev.map(x => x.toLowerCase()).includes(t.toLowerCase())) return prev;
        const next = [...prev, t];
        syncSettings({ expense_tags: next });
        return next;
      });
    } else {
      setIncomeTags(prev => {
        if (prev.map(x => x.toLowerCase()).includes(t.toLowerCase())) return prev;
        const next = [...prev, t];
        syncSettings({ income_tags: next });
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeTag = useCallback((kind: 'expense' | 'income', name: string) => {
    if (kind === 'expense') {
      setExpenseTags(prev => {
        const next = prev.filter(t => t !== name);
        syncSettings({ expense_tags: next });
        return next;
      });
    } else {
      setIncomeTags(prev => {
        const next = prev.filter(t => t !== name);
        syncSettings({ income_tags: next });
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renameTag = useCallback((kind: 'expense' | 'income', oldName: string, newName: string) => {
    const t = newName.trim();
    if (!t || t === oldName) return;
    if (kind === 'expense') {
      setExpenseTags(prev => {
        const next = prev.map(x => x === oldName ? t : x);
        syncSettings({ expense_tags: next });
        return next;
      });
    } else {
      setIncomeTags(prev => {
        const next = prev.map(x => x === oldName ? t : x);
        syncSettings({ income_tags: next });
        return next;
      });
    }
    setEntries(prev => prev.map(e => e.tag === oldName ? { ...e, tag: t } : e));
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('entries').update({ tag: t }).eq('user_id', user.id).eq('tag', oldName);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Entry CRUD ──────────────────────────────────────────────────
  const addEntry = useCallback(async (
    data: Omit<Entry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('entries')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (!error && inserted) {
      setEntries(prev => [inserted as Entry, ...prev]);
      flash('Saved');
    }
  }, [flash, supabase]);

  const updateEntry = useCallback(async (entry: Entry) => {
    const { error } = await supabase
      .from('entries')
      .update({
        date: entry.date,
        kind: entry.kind,
        tag: entry.tag,
        note: entry.note,
        person: entry.person,
        amount: entry.amount,
        original_amount: entry.original_amount,
        original_currency: entry.original_currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id);
    if (!error) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
      flash('Updated');
    }
  }, [flash, supabase]);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== id));
      setPendingDelete(null);
    }
  }, [supabase]);

  const clearAllEntries = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('entries').delete().eq('user_id', user.id);
    setEntries([]);
    flash('All records cleared');
  }, [flash, supabase]);

  return (
    <AppContext.Provider value={{
      T, dark, setDark,
      displayCurrency, setDisplayCurrency,
      rates, setRates, ratesDate,
      fmt: fmtBound,
      expenseTags, incomeTags, addTag, removeTag, renameTag,
      entries, loaded, addEntry, updateEntry, deleteEntry, clearAllEntries,
      toast, flash,
      pendingDelete, setPendingDelete,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
