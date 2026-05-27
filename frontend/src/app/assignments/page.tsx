'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Search, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { EmptyState } from '@/components/assignments/EmptyState';
import { useAssignmentStore } from '@/store/assignmentStore';
import { assignmentApi } from '@/services/api';

export default function AssignmentsPage() {
  const {
    assignments,
    isLoadingAssignments,
    setAssignments,
    setLoadingAssignments,
    removeAssignment,
    updateAssignment,
  } = useAssignmentStore();
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoadingAssignments(true);
    setError(null);
    try {
      const data = await assignmentApi.getAll();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await assignmentApi.delete(id);
      removeAssignment(id);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      await assignmentApi.regenerate(id);
      updateAssignment(id, { status: 'processing' });
    } catch (err: any) {
      alert(`Regenerate failed: ${err.message}`);
    }
  };

  const filtered = assignments.filter(
    (a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.class.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const processing = assignments.filter((a) => a.status === 'processing' || a.status === 'pending').length;
  const failed = assignments.filter((a) => a.status === 'failed').length;

  return (
    <AppShell title="Assignments">
      <div style={{ padding: '40px 48px 80px', maxWidth: 1400, margin: '0 auto' }}>
        {/* ── Page header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: '#1A1A1A',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                letterSpacing: '-0.5px',
              }}
            >
              Assignments
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', marginTop: 4 }}>
              {isLoadingAssignments
                ? 'Loading…'
                : assignments.length === 0
                ? 'No assignments yet — create your first one'
                : `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} total`}
            </p>
          </div>

          <Link
            href="/assignments/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              backgroundColor: '#1A1A1A',
              color: '#FFFFFF',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1.5px solid #FF5A1F',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(255, 90, 31, 0.15)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#2D2D2D';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(255, 90, 31, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#1A1A1A';
              (e.currentTarget as HTMLElement).style.transform = 'none';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(255, 90, 31, 0.15)';
            }}
          >
            <Sparkles size={16} color="#FF5A1F" />
            New Assignment
          </Link>
        </div>

        {/* ── Stats row ── */}
        {!isLoadingAssignments && assignments.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 32,
              flexWrap: 'wrap',
            }}
          >
            {[
              { icon: FileText, label: 'Total', value: assignments.length, color: '#4B5563', bg: '#F3F4F6' },
              { icon: CheckCircle2, label: 'Completed', value: completed, color: '#16A34A', bg: '#DCFCE7' },
              { icon: Clock, label: 'In Progress', value: processing, color: '#D97706', bg: '#FEF9C3' },
              { icon: AlertCircle, label: 'Failed', value: failed, color: '#DC2626', bg: '#FEE2E2' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 18px',
                  backgroundColor: bg,
                  borderRadius: 14,
                  border: `1px solid rgba(0,0,0,0.02)`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <Icon size={18} color={color} />
                <span style={{ fontSize: 16, fontWeight: 700, color }}>
                  {value}
                </span>
                <span style={{ fontSize: 14, color, opacity: 0.85, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 10,
              fontSize: 13.5,
              color: '#DC2626',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button
              onClick={load}
              style={{
                fontWeight: 600,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                color: '#DC2626',
                fontSize: 13,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Search ── */}
        {assignments.length > 0 && (
          <div style={{ position: 'relative', maxWidth: 400, marginBottom: 28 }}>
            <Search
              size={18}
              color="#9CA3AF"
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search by title, subject, or class…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field shadow-sm"
              style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 12 }}
            />
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {isLoadingAssignments && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ borderRadius: 12, height: 150 }} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoadingAssignments && assignments.length === 0 && !error && <EmptyState />}

        {/* ── Assignment grid ── */}
        {!isLoadingAssignments && filtered.length > 0 && (
          <AnimatePresence>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16,
              }}
            >
              {filtered.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <AssignmentCard
                    assignment={a}
                    onDelete={handleDelete}
                    onRegenerate={handleRegenerate}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* ── No results ── */}
        {!isLoadingAssignments && assignments.length > 0 && filtered.length === 0 && (
          <div
            style={{
              padding: '48px 32px',
              textAlign: 'center',
              color: '#6B7280',
              fontSize: 14,
            }}
          >
            <Search size={28} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>No results found</p>
            <p>No assignments match &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch('')}
              style={{
                marginTop: 12,
                color: '#FF5A1F',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
