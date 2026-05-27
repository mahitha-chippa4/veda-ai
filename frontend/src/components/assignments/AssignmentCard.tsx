'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MoreVertical, Trash2, RefreshCw, ExternalLink, Clock, FileText } from 'lucide-react';
import { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  completed: { label: 'Completed', color: '#16A34A', bg: '#DCFCE7', dot: '#16A34A' },
  processing: { label: 'Generating...', color: '#D97706', bg: '#FEF9C3', dot: '#D97706' },
  pending: { label: 'Pending', color: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
  failed: { label: 'Failed', color: '#DC2626', bg: '#FEE2E2', dot: '#DC2626' },
};

export function AssignmentCard({ assignment, onDelete, onRegenerate }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;
  const createdAt = new Date(assignment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const totalQ = assignment.questionTypes?.reduce((s, qt) => s + (qt.count || 0), 0) || 0;
  const totalM = assignment.questionTypes?.reduce((s, qt) => s + (qt.count || 0) * (qt.marks || 0), 0) || 0;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #F3F4F6',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 24px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)';
        (e.currentTarget as HTMLElement).style.transform = 'none';
      }}
    >
      {/* Orange top accent stripe */}
      <div style={{ height: 4, backgroundColor: assignment.status === 'completed' ? '#FF5A1F' : assignment.status === 'failed' ? '#DC2626' : '#D97706' }} />

      <div style={{ padding: '20px 22px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/assignments/${assignment._id}`}
              style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', textDecoration: 'none', display: 'block', marginBottom: 4, letterSpacing: '-0.2px' }}
            >
              {assignment.title}
            </Link>
            <p style={{ fontSize: 13.5, color: '#6B7280', fontWeight: 500 }}>{assignment.subject} • {assignment.class}</p>
          </div>

          {/* Menu */}
          <div style={{ position: 'relative', marginLeft: 8 }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#9CA3AF' }}
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute', right: 0, top: 30, zIndex: 50,
                  backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160, overflow: 'hidden',
                }}
              >
                <Link
                  href={`/assignments/${assignment._id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#374151', textDecoration: 'none' }}
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink size={14} /> View
                </Link>
                <button
                  onClick={() => { onRegenerate(assignment._id); setMenuOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#374151', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <RefreshCw size={14} /> Regenerate
                </button>
                <button
                  onClick={() => { onDelete(assignment._id); setMenuOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', fontSize: 13, color: '#DC2626', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #F3F4F6' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12.5, color: '#6B7280' }}>
          {totalQ > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={12} /> {totalQ} questions</span>}
          {totalM > 0 && <span>{totalM} marks</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {createdAt}</span>
        </div>

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px',
              backgroundColor: status.bg,
              color: status.color,
              borderRadius: 999,
              fontSize: 12, fontWeight: 600,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: status.dot }} />
            {status.label}
          </span>

          {assignment.status === 'completed' && (
            <Link
              href={`/assignments/${assignment._id}`}
              style={{ fontSize: 12.5, fontWeight: 600, color: '#FF5A1F', textDecoration: 'none' }}
            >
              View Paper →
            </Link>
          )}
        </div>
      </div>

      {/* Click-outside to close menu */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
