'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F8FF', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      {/* Navbar */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" rx="22" fill="#1A1A1A" />
            <path d="M22 32 L41 72 L58 72 L39 32 Z" fill="#FFFFFF" />
            <path d="M78 32 L58 72 L41 72 L61 32 Z" fill="#FFFFFF" />
          </svg>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
            VedaAI
          </span>
        </div>
        
        <Link 
          href="/signup" 
          style={{ 
            padding: '12px 28px', 
            backgroundColor: '#1A1A1A', 
            color: 'white', 
            borderRadius: 30, 
            textDecoration: 'none', 
            fontWeight: 600,
            fontSize: 15,
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
          }}
        >
          Sign Up
        </Link>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', textAlign: 'center', position: 'relative' }}>
        
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: -100, left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,90,31,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <h1 style={{ fontSize: 64, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 24 }}>
            AI Academic Assessment & <br />
            <span style={{ color: '#FF5A1F', backgroundColor: '#FFF0EA', padding: '0 16px', borderRadius: 16 }}>Intelligence System</span>
          </h1>

          <p style={{ fontSize: 18, color: '#6B7280', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
            An AI academic system for assessment, teaching, and personalised learning - 
            designed to improve academic outcomes, reduce cost & time, and strengthen institutional credibility.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link 
              href="/signup"
              style={{ 
                display: 'inline-block',
                padding: '16px 36px', 
                backgroundColor: '#1A1A1A', 
                color: 'white', 
                borderRadius: 30, 
                textDecoration: 'none', 
                fontWeight: 600,
                fontSize: 16,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
            >
              Get Started for Free
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 24, 
          width: '100%', 
          maxWidth: 1000, 
          marginTop: 80,
          position: 'relative',
          zIndex: 1
        }}>
          {[
            { title: 'AI Question Generation', desc: 'Instantly generate high-quality question papers from your syllabus with perfect formatting.', icon: '⚡️' },
            { title: 'Personalized Insights', desc: 'Track student performance and identify learning gaps automatically using our intelligence engine.', icon: '📊' },
            { title: 'Save 90% Time', desc: 'Automate the tedious parts of assessment creation so you can focus on actual teaching.', icon: '⏳' }
          ].map((feat, i) => (
            <div key={i} style={{ 
              backgroundColor: 'white', 
              padding: 32, 
              borderRadius: 24, 
              textAlign: 'left',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{feat.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>{feat.title}</h3>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
