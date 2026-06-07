'use client';

import { useApp } from '@/contexts/AppContext';
import type { Entry } from '@/lib/types';

interface Props {
  rows: Entry[];
  month: string;
}

export default function DailySparkline({ rows, month }: Props) {
  const { T, fmt } = useApp();
  const [yr, mo] = month.split('-').map(Number);
  const days = new Date(yr, mo, 0).getDate();

  const dailyExp = Array.from({ length: days }, (_, i) => {
    const d = `${month}-${String(i + 1).padStart(2, '0')}`;
    return rows.filter(e => e.date === d && e.kind === 'expense').reduce((s, e) => s + e.amount, 0);
  });

  const max = Math.max(...dailyExp, 1);
  const barW = Math.max(4, Math.floor(280 / days) - 1);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, letterSpacing: '0.16em', color: T.muted, textTransform: 'uppercase', marginBottom: 10 }}>
        Daily Spending
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 40, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {dailyExp.map((val, i) => {
          const h = val > 0 ? Math.max(3, Math.round((val / max) * 36)) : 2;
          const isToday = `${month}-${String(i + 1).padStart(2, '0')}` === new Date().toISOString().slice(0, 10);
          return (
            <div key={i} title={`${i + 1}: ${val > 0 ? fmt(val) : '₦0'}`} style={{
              width: barW, minWidth: barW, height: h,
              background: isToday ? T.accent : (val > 0 ? T.red : T.border),
              borderRadius: 2, opacity: val > 0 ? 0.8 : 0.3,
              alignSelf: 'flex-end', flexShrink: 0, cursor: 'default',
              transition: 'height 0.3s ease',
            }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: T.muted }}>
        <span>1</span><span>{Math.floor(days / 2)}</span><span>{days}</span>
      </div>
    </div>
  );
}
