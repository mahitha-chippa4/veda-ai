'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
  showBack?: boolean;
  title?: string;
}

const SIDEBAR_WIDTH = 260;

export function AppShell({ children, showBack = false, title = 'Assignment' }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F7', flexDirection: 'column' }}
    >
      

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
          }}
          className="md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div style={{ width: 280, padding: 12 }} onClick={e => e.stopPropagation()}>
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div style={{ display: 'flex', flex: 1, padding: '16px', gap: '16px', height: 'calc(100vh - 65px)' }}>
        {/* Desktop Sidebar */}
        <div className="hidden md:block" style={{ width: 256, flexShrink: 0 }}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <TopBar showBack={showBack} title={title} onOpenMenu={() => setMobileMenuOpen(true)} />
          <main style={{ flex: 1, overflowY: 'auto', paddingTop: 16, paddingBottom: 32 }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
