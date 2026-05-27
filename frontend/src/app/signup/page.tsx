'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';

import { authApi } from '@/services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authApi.login({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('veda_username', data.user.name);
      } else {
        const data = await authApi.register({ name, email, password, schoolName });
        localStorage.setItem('token', data.token);
        localStorage.setItem('veda_username', data.user.name);
      }
      router.push('/assignments');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, backgroundColor: 'white', borderRadius: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" rx="22" fill="#1A1A1A" />
              <path d="M22 32 L41 72 L58 72 L39 32 Z" fill="#FFFFFF" />
              <path d="M78 32 L58 72 L41 72 L61 32 Z" fill="#FFFFFF" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>
            {isLogin ? 'Welcome back to VedaAI' : 'Create your VedaAI account'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            {isLogin ? "Enter your details to access your dashboard" : "Sign up to start generating assignments instantly"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#DC2626', fontSize: 13, marginBottom: 8 }}>
              {error}
            </div>
          )}
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Sarah Jenkins" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', outline: 'none', fontSize: 14 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>School Name (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Delhi Public School" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB', outline: 'none', fontSize: 14 }} />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16 }} />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@school.edu" style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid #E5E7EB', outline: 'none', fontSize: 14 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16 }} />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, border: '1px solid #E5E7EB', outline: 'none', fontSize: 14 }} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{ 
              marginTop: 8,
              width: '100%', 
              padding: '14px', 
              backgroundColor: loading ? '#9CA3AF' : '#FF5A1F', 
              color: 'white', 
              borderRadius: 12, 
              border: 'none', 
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 90, 31, 0.2)'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In to Dashboard' : 'Create Account')}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: '#FF5A1F', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href="/" style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
