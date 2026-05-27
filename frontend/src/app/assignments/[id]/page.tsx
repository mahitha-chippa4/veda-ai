'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ExamPaper } from '@/components/paper/ExamPaper';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { usePDFExport } from '@/hooks/usePDFExport';
import { assignmentApi } from '@/services/api';
import { Assignment, GeneratedPaper } from '@/types';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { getGenerationState, setGenerationState, getPaper, setPaper } = useAssignmentStore();
  const { exportToPDF } = usePDFExport();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Real-time WebSocket updates
  useWebSocket(id);

  const genState = getGenerationState(id);
  const cachedPaper = getPaper(id);
  const paper = cachedPaper || genState.paper;

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await assignmentApi.getById(id);
        if (!isMounted) return;

        setAssignment(data);

        if (data.status === 'completed') {
          setGenerationState(id, { status: 'completed', progress: 100, message: 'Paper ready' });
          if (!cachedPaper) {
            try {
              const p = await assignmentApi.getPaper(id);
              if (isMounted) {
                setPaper(id, p);
                setGenerationState(id, { paper: p });
              }
            } catch {}
          }
        } else if (data.status === 'processing') {
          setGenerationState(id, { status: 'processing', progress: 45, message: 'Generating questions with AI...' });
        } else if (data.status === 'failed') {
          setGenerationState(id, { status: 'failed', progress: 0, message: 'Generation failed', error: data.errorMessage });
        } else {
          setGenerationState(id, { status: 'pending', progress: 10, message: 'Queued for generation...' });
        }
      } catch (err) {
        console.error('Load failed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();

    return () => { isMounted = false; };
  }, [id, cachedPaper, setGenerationState, setPaper]);

  // Polling fallback mechanism
  useEffect(() => {
    let pollTimer: NodeJS.Timeout;
    let isMounted = true;
    let pollCount = 0;
    const MAX_POLLS = 40; // max 40 polls * 3s = 120s

    const pollStatus = async () => {
      if (!isMounted) return;
      
      const currentGenState = getGenerationState(id);
      if (currentGenState.status === 'completed' || currentGenState.status === 'failed') {
        return; // stop polling
      }

      if (pollCount >= MAX_POLLS) {
        setGenerationState(id, { status: 'failed', progress: 0, message: 'Generation timed out', error: 'The request took too long. Please try regenerating.' });
        return;
      }

      console.log("Polling assignment status...");
      try {
        const data = await assignmentApi.getById(id);
        if (!isMounted) return;
        
        if (data.status === 'completed') {
          console.log("Paper generation completed");
          setGenerationState(id, { status: 'completed', progress: 100, message: 'Paper ready' });
          
          if (!getPaper(id)) {
            const p = await assignmentApi.getPaper(id);
            if (isMounted) {
              setPaper(id, p);
              setGenerationState(id, { paper: p });
            }
          }
        } else if (data.status === 'failed') {
          setGenerationState(id, { status: 'failed', progress: 0, message: 'Generation failed', error: data.errorMessage });
        } else {
          // Still processing, update progress UX
          pollCount++;
          let newProgress = currentGenState.progress || 10;
          let newMessage = currentGenState.message || 'Generating questions with AI...';
          
          if (newProgress < 90) newProgress += 5;
          if (pollCount >= 5) newMessage = 'Almost done...'; // after 15 seconds

          setGenerationState(id, { status: 'processing', progress: newProgress, message: newMessage });
          pollTimer = setTimeout(pollStatus, 3000);
        }
      } catch (err) {
        console.error('Poll failed:', err);
        // Retry polling on error to handle intermittent network drops
        if (isMounted) pollTimer = setTimeout(pollStatus, 5000);
      }
    };

    if (genState.status === 'processing' || genState.status === 'pending') {
      pollTimer = setTimeout(pollStatus, 3000);
    }

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [id, genState.status, getGenerationState, setGenerationState, getPaper, setPaper]);

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate paper? The current paper will be replaced.')) return;
    setIsRegenerating(true);
    try {
      await assignmentApi.regenerate(id);
      setGenerationState(id, {
        status: 'processing',
        progress: 5,
        message: 'Starting regeneration...',
        paper: null,
        error: null,
      });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!paper) return;
    setIsExporting(true);
    try {
      await exportToPDF(paper, {
        title: assignment?.title,
        class: assignment?.class,
        subject: assignment?.subject,
        schoolName: assignment?.schoolName || paper.schoolName,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <AppShell showBack title="Assignment">
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px 40px' }}>
          <div
            className="skeleton"
            style={{ borderRadius: '0 0 16px 16px', height: 100, marginBottom: 20 }}
          />
          <div className="skeleton" style={{ borderRadius: 12, height: 500 }} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showBack title="Assignment">
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px 60px' }}>

        {/* ── Dark AI Banner ── */}
        <div
          style={{
            backgroundColor: '#2D2D2D',
            borderRadius: '0 0 16px 16px',
            padding: '20px 24px',
            marginBottom: 20,
          }}
        >
          {/* AI message */}
          {paper && (
            <p style={{ fontSize: 13.5, color: '#E5E7EB', lineHeight: '1.65', marginBottom: 14 }}>
              <strong style={{ color: '#FF5A1F' }}>✦ VedaAI:</strong>{' '}
              Certainly! Here are customized Question Papers for your{' '}
              {assignment?.class && (
                <strong style={{ color: '#FFFFFF' }}>{assignment.class}</strong>
              )}{' '}
              {assignment?.subject && (
                <strong style={{ color: '#FFFFFF' }}>{assignment.subject}</strong>
              )}{' '}
              classes on the{' '}
              <strong style={{ color: '#FFFFFF' }}>
                {assignment?.chapters?.slice(0, 3).join(', ')}
                {(assignment?.chapters?.length ?? 0) > 3 ? '…' : ''}
              </strong>{' '}
              chapters:
            </p>
          )}

          {!paper && (genState.status === 'processing' || genState.status === 'pending') && (
            <p style={{ fontSize: 13.5, color: '#E5E7EB', lineHeight: '1.65', marginBottom: 14 }}>
              <strong style={{ color: '#FF5A1F' }}>✦ VedaAI:</strong>{' '}
              Generating your customized question paper, please wait…
            </p>
          )}

          {!paper && genState.status === 'failed' && (
            <p style={{ fontSize: 13.5, color: '#FCA5A5', lineHeight: '1.65', marginBottom: 14 }}>
              <strong>Generation failed:</strong>{' '}
              {genState.error || 'An error occurred. Please try again.'}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {paper && (
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: isExporting ? 'wait' : 'pointer',
                  transition: 'opacity 0.15s',
                  opacity: isExporting ? 0.7 : 1,
                }}
              >
                <Download size={14} />
                {isExporting ? 'Exporting…' : 'Download as PDF'}
              </button>
            )}

            {paper && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#E5E7EB',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.18)',
                  cursor: isRegenerating ? 'wait' : 'pointer',
                  opacity: isRegenerating ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <RefreshCw size={13} style={{ animation: isRegenerating ? 'spin 1s linear infinite' : 'none' }} />
                Regenerate
              </button>
            )}
          </div>
        </div>

        {/* ── Status / Paper Area ── */}
        <AnimatePresence mode="wait">
          {/* Processing / Pending */}
          {(genState.status === 'pending' || genState.status === 'processing') && !paper && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                padding: 48,
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, #FF5A1F 0%, #C2410C 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={28} color="white" />
                </div>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
                Generating Your Paper
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
                {genState.message || 'AI is crafting your questions…'}
              </p>
              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 340,
                  margin: '0 auto',
                  background: '#F3F4F6',
                  borderRadius: 999,
                  height: 6,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${genState.progress}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #FF5A1F, #F97316)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <p style={{ marginTop: 10, fontSize: 13, color: '#9CA3AF' }}>
                {genState.progress}% complete
              </p>
              <p style={{ marginTop: 16, fontSize: 12, color: '#D1D5DB' }}>
                This usually takes 15–30 seconds. Stay on this page.
              </p>
            </motion.div>
          )}

          {/* Failed */}
          {genState.status === 'failed' && !paper && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #FCA5A5',
                padding: 40,
                textAlign: 'center',
              }}
            >
              <AlertTriangle size={40} color="#DC2626" style={{ margin: '0 auto 14px' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
                Generation Failed
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
                {genState.error || 'Something went wrong. Please try again.'}
              </p>
              <button
                onClick={handleRegenerate}
                style={{
                  padding: '10px 28px',
                  backgroundColor: '#1A1A1A',
                  color: 'white',
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Paper ready */}
          {paper && (
            <motion.div key="paper" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ExamPaper paper={paper} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
