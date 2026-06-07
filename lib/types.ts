export type Currency = 'NGN' | 'USD' | 'EUR';
export type EntryKind = 'income' | 'expense';

export interface Entry {
  id: string;
  user_id?: string;
  date: string;
  kind: EntryKind;
  tag: string;
  note: string;
  person: string;
  amount: number;
  original_amount?: number;
  original_currency?: Currency;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  user_id: string;
  dark_mode: boolean;
  display_currency: Currency;
  rate_usd: number;
  rate_eur: number;
  expense_tags: string[];
  income_tags: string[];
  updated_at?: string;
}

export interface Rates {
  USD: number;
  EUR: number;
}

export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  sub: string;
  muted: string;
  nav: string;
  navText: string;
  green: string;
  red: string;
  accent: string;
}
