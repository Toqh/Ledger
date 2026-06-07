'use client';

import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import Nav from '@/components/Nav';
import FAB from '@/components/FAB';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { T, toast, pendingDelete, setPendingDelete, deleteEntry } = useApp();
  const pathname = usePathname();

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: T.bg,
      minHeight: '100vh',
      color: T.text,
      transition: 'background 0.25s, color 0.25s',
    }}>
      <Nav />
      <main>{children}</main>
      <FAB pathname={pathname} />

      {pendingDelete && (
        <DeleteConfirmModal
          entry={pendingDelete}
          onConfirm={() => deleteEntry(pendingDelete.id)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: T.text, color: T.bg, fontSize: 12, fontWeight: 600,
          padding: '9px 22px', borderRadius: 100, animation: 'pop 0.2s ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)', zIndex: 999, whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
