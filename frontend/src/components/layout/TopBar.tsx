'use client';

import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LayoutGrid, ArrowLeft, Menu, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authApi } from '@/services/api';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  onOpenMenu?: () => void;
}

export function TopBar({ showBack = false, title = 'Assignment', onOpenMenu }: TopBarProps) {
  const router = useRouter();
  const [username, setUsername] = useState('Loading...');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authApi.getMe();
        setUsername(user.name);
      } catch (error) {
        setUsername('Guest');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('veda_username');
    router.push('/signup');
  };

  const seed = username.split(' ')[0] || 'User';

  return (
    <header
      style={{
        position: 'sticky',
        top: 16,
        zIndex: 30,
        height: 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      {/* Left: back + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className="md:hidden flex items-center justify-center mr-2"
          onClick={onOpenMenu}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: '#1A1A1A'
          }}
        >
          <Menu size={20} />
        </button>

        {showBack && (
          <button
            onClick={() => router.back()}
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#6B7280',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#F3F4F6')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF' }}>
          <LayoutGrid size={16} strokeWidth={1.75} />
          <span className="hidden sm:inline" style={{ fontSize: 14, fontWeight: 500, color: '#9CA3AF' }}>{title}</span>
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              color: '#6B7280',
            }}
          >
            <Bell size={19} strokeWidth={1.75} />
          </button>
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              backgroundColor: '#EF4444',
              borderRadius: '50%',
              border: '2px solid white',
            }}
          />
        </div>

        <div style={{ width: 1, height: 22, backgroundColor: '#E5E7EB' }} />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 12,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#F9FAFB')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
              alt={username} 
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#FFE4E6',
                border: '1px solid #F3F4F6',
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{username}</span>
            <ChevronDown size={16} color="#9CA3AF" />
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                backgroundColor: 'white',
                borderRadius: 12,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                border: '1px solid #E5E7EB',
                width: 160,
                zIndex: 50,
                padding: '8px 0',
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#DC2626',
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: 'left',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#FEF2F2')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
