import {
  Home, Briefcase, User, FlaskConical, Handshake, Zap, Tag,
  type LucideIcon,
} from 'lucide-react';

export const DEFAULT_EXPENSE_TAGS = ['Essentials', 'Work & Ministry', 'Personal'];
export const DEFAULT_INCOME_TAGS = ['Research & Grants', 'Consulting & Service', 'Hustle & Returns'];
export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const TAG_ICON: Record<string, LucideIcon> = {
  'Essentials': Home,
  'Work & Ministry': Briefcase,
  'Personal': User,
  'Research & Grants': FlaskConical,
  'Consulting & Service': Handshake,
  'Hustle & Returns': Zap,
};

export const DEFAULT_CUSTOM_ICON: LucideIcon = Tag;

export function getIcon(t: string): LucideIcon {
  return TAG_ICON[t] || DEFAULT_CUSTOM_ICON;
}
