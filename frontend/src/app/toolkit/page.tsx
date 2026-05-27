'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Wrench, BookOpen, CheckSquare, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/services/api';

export default function ToolkitPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  // Form State
  const [topic, setTopic] = useState('');
  const [className, setClassName] = useState('');
  const [context, setContext] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/toolkit/generate', {
        toolType: activeTool,
        topic,
        class: className,
        additionalContext: context
      });
      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const resetTool = () => {
    setActiveTool(null);
    setTopic('');
    setClassName('');
    setContext('');
    setResult(null);
    setError('');
  };

  return (
    <AppShell title="AI Teacher's Toolkit">
      <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
        
        {!activeTool ? (
          <>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                AI Teacher&apos;s Toolkit
              </h1>
              <p style={{ color: '#6B7280', fontSize: 15 }}>
                Supercharge your workflow with AI-powered tools designed specifically for educators.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              
              {/* Lesson Planner Tool */}
              <button
                onClick={() => setActiveTool('lesson_plan')}
                style={{
                  textAlign: 'left',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: 16,
                  padding: 24,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
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
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} color="#FF5A1F" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Lesson Planner</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>
                    Generate comprehensive, structured lesson plans in seconds based on any topic and grade level.
                  </p>
                </div>
              </button>

              {/* Rubric Generator Tool */}
              <button
                onClick={() => setActiveTool('rubric')}
                style={{
                  textAlign: 'left',
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: 16,
                  padding: 24,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
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
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquare size={24} color="#0284C7" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Rubric Generator</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>
                    Create detailed, fair, and objective grading rubrics for assignments, projects, or essays.
                  </p>
                </div>
              </button>

            </div>
          </>
        ) : (
          <div>
            <button
              onClick={resetTool}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontWeight: 500, marginBottom: 24, padding: 0 }}
            >
              <ArrowLeft size={18} /> Back to Toolkit
            </button>
            
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 320px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {activeTool === 'lesson_plan' ? <BookOpen size={20} color="#FF5A1F" /> : <CheckSquare size={20} color="#0284C7" />}
                  {activeTool === 'lesson_plan' ? 'Lesson Planner' : 'Rubric Generator'}
                </h2>
                <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Topic / Subject</label>
                    <input required type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Photosynthesis" style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Class / Grade Level</label>
                    <input type="text" value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. Grade 8" style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>Additional Context</label>
                    <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Any specific requirements or focus areas..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, minHeight: 100, resize: 'vertical' }} />
                  </div>
                  <button disabled={loading} type="submit" style={{ marginTop: 8, width: '100%', padding: '12px', backgroundColor: '#1A1A1A', color: 'white', fontWeight: 600, fontSize: 14, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Generating...' : 'Generate with AI'}
                  </button>
                  {error && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{error}</p>}
                </form>
              </div>

              <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32, minHeight: 500 }}>
                {loading ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                    <Wrench size={32} color="#D1D5DB" style={{ marginBottom: 16, animation: 'spin 2s linear infinite' }} />
                    <p>AI is generating your content...</p>
                  </div>
                ) : result ? (
                  <div className="markdown-body" style={{ lineHeight: 1.6, color: '#374151', fontSize: 15 }}>
                    <style>{`
                      .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #1A1A1A; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
                      .markdown-body h1 { font-size: 1.5em; }
                      .markdown-body h2 { font-size: 1.3em; }
                      .markdown-body h3 { font-size: 1.1em; }
                      .markdown-body p { margin-bottom: 1em; }
                      .markdown-body ul, .markdown-body ol { margin-bottom: 1em; padding-left: 2em; }
                      .markdown-body li { margin-bottom: 0.25em; }
                      .markdown-body strong { font-weight: 600; color: #1A1A1A; }
                      .markdown-body hr { border: none; border-top: 1px solid #E5E7EB; margin: 2em 0; }
                      .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
                      .markdown-body th, .markdown-body td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
                      .markdown-body th { background-color: #F9FAFB; font-weight: 600; }
                    `}</style>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                    <p>Fill out the form and click Generate to see results here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
