'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Users,
  FileText,
  Wrench,
  BookOpen,
  Sparkles,
  Settings,
} from 'lucide-react';
import { authApi } from '@/services/api';
import SettingsModal from '../modals/SettingsModal';

const NAV_ITEMS = [
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/groups', label: 'My Groups', icon: Users },
  { href: '/toolkit', label: "AI Teacher's Toolkit", icon: Wrench },
  { href: '/library', label: 'My Library', icon: BookOpen },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user in sidebar');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const seed = user?.name?.split(' ')[0] || 'Teacher';

  return (
    <>
      <aside
        className="flex flex-col bg-white"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 16px' }}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              <defs>
                <linearGradient id="bgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#EE8530" />
                  <stop offset="50%" stopColor="#C24118" />
                  <stop offset="100%" stopColor="#4E1A11" />
                </linearGradient>
                <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                  <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="vGradLeft" x1="15" y1="28" x2="49" y2="78" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#D1D5DB" />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="22" fill="url(#bgGrad)" />
              <rect width="100" height="100" rx="22" fill="url(#grid)" />
              <path d="M16 28 L41 78 L58 78 L33 28 Z" fill="url(#vGradLeft)" />
              <path d="M84 28 L58 78 L41 78 L67 28 Z" fill="#FFFFFF" />
            </svg>
            <span
              style={{
                fontSize: 21,
                fontWeight: 800,
                color: '#1A1A1A',
                fontFamily: 'Inter, "Plus Jakarta Sans", sans-serif',
                letterSpacing: '-0.5px',
                lineHeight: 1,
              }}
            >
              VedaAI
            </span>
          </div>
        </Link>

        {/* Create Assignment Button */}
        <div style={{ padding: '0 16px 16px' }}>
          <Link
            href="/assignments/create"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 0',
              background: '#232323',
              color: '#FFFFFF',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#111';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#232323';
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            <Sparkles size={14} color="#FF5A1F" />
            <span>Create Assignment</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/assignments'
              ? pathname.startsWith('/assignments')
              : pathname === href;

            return (
              <Link
                key={`${label}-${href}`}
                href={href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#1A1A1A' : '#6B7280',
                  backgroundColor: isActive ? '#F3F4F6' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB';
                    (e.currentTarget as HTMLElement).style.color = '#374151';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#6B7280';
                  }
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div style={{ padding: '8px 10px 12px' }}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#6B7280',
              fontSize: 13.5,
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 6,
              transition: 'background 0.15s',
              borderRadius: 10,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>

          <div style={{
            backgroundColor: '#F3F4F6',
            borderRadius: 14,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
              alt="Avatar"
              style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#E5E7EB', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1A1A', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.schoolName || 'VedaAI User'}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Teacher'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          user={user}
          onUpdate={fetchUser}
        />
      )}
    </>
  );
}
