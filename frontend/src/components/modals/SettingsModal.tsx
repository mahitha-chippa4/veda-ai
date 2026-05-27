'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Lock, School, User as UserIcon } from 'lucide-react';
import { authApi } from '@/services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: () => void;
}

export default function SettingsModal({ isOpen, onClose, user, onUpdate }: SettingsModalProps) {
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSchoolName(user.schoolName || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const dataToUpdate: any = { name, schoolName };
      if (password) {
        dataToUpdate.password = password;
      }
      
      const updatedUser = await authApi.updateMe(dataToUpdate);
      localStorage.setItem('veda_username', updatedUser.name);
      
      setSuccessMessage('Profile updated successfully!');
      setPassword(''); // clear password field after successful update
      onUpdate(); // refresh sidebar/topbar data
      
      // Close after a short delay so they see the success message
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'white',
          borderRadius: 24,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Account Settings</h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0 0' }}>Update your personal details and password.</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              border: 'none',
              background: '#F3F4F6',
              color: '#4B5563',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E5E7EB')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F3F4F6')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#DC2626', fontSize: 13 }}>
              {error}
            </div>
          )}
          
          {successMessage && (
            <div style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 12, color: '#059669', fontSize: 13 }}>
              {successMessage}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Full Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <UserIcon size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16 }} />
              <input 
                required 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Sarah Jenkins"
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid #E5E7EB', outline: 'none', fontSize: 14 }} 
              />
            </div>
          </div>

          {/* School Name Field */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>School Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <School size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16 }} />
              <input 
                type="text" 
                value={schoolName} 
                onChange={e => setSchoolName(e.target.value)}
                placeholder="Delhi Public School"
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid #E5E7EB', outline: 'none', fontSize: 14 }} 
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>New Password (Optional)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16 }} />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid #E5E7EB', outline: 'none', fontSize: 14 }} 
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                background: 'white',
                border: '1px solid #E5E7EB',
                color: '#374151',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: loading ? '#9CA3AF' : '#1A1A1A',
                border: 'none',
                color: 'white',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = '#000000')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = '#1A1A1A')}
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
