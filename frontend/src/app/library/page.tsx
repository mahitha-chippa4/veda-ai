'use client';

import { AppShell } from '@/components/layout/AppShell';
import { BookOpen, FileText, Calendar, Plus, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  class: string;
  createdAt: string;
  dueDate?: string;
  status: string;
}

export default function LibraryPage() {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    api.get('/assignments')
      .then(res => {
        const data = res.data;
        if (data.success && Array.isArray(data.data)) {
          // We can choose to show all or just completed. The user said "all the save assignments which i created"
          setAssignments(data.data);
        } else {
          setAssignments([]);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load library');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="My Library">
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A' }}>
            My Library
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>Loading your library...</div>
        ) : error ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#EF4444' }}>{error}</div>
        ) : assignments.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '50vh', textAlign: 'center', color: '#6B7280' }}>
            <BookOpen size={32} color="#9CA3AF" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
              Library is Empty
            </h2>
            <p style={{ fontSize: 14, maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
              Your generated question papers and saved resources will appear here. Create an assignment to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {assignments.map(a => (
              <Link
                key={a._id}
                href={`/paper/${a._id}`}
                style={{
                  textDecoration: 'none',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#FF5A1F';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(255, 90, 31, 0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} color="#FF5A1F" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>{a.title}</h3>
                      <p style={{ fontSize: 13, color: '#6B7280' }}>{a.subject} • Class {a.class}</p>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
                    <Calendar size={14} />
                    <span>Created: {new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  {a.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#F59E0B' }}>
                      <Clock size={14} />
                      <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
