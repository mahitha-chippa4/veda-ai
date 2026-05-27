'use client';

import { GeneratedPaper } from '@/types';
import { QuestionItem } from './QuestionCard';

interface ExamPaperProps {
  paper: GeneratedPaper;
}

export function ExamPaper({ paper }: ExamPaperProps) {
  const schoolName = paper.schoolName || 'VedaAI School';
  const totalMarks =
    paper.totalMarks ||
    paper.sections.flatMap((s) => s.questions).reduce((sum, q) => sum + (q.marks || 0), 0);
  const allQuestions = paper.sections.flatMap((s) => s.questions);

  return (
    <div
      id="exam-paper"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <div style={{ padding: '36px 44px' }}>
        {/* ── School Header (centered) ── */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 6,
              fontFamily: '"Times New Roman", Times, serif',
              letterSpacing: '0.01em',
            }}
          >
            {schoolName}
          </h1>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 2,
              fontFamily: '"Times New Roman", Times, serif',
            }}
          >
            Subject: {paper.subject}
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              fontFamily: '"Times New Roman", Times, serif',
            }}
          >
            Class: {paper.class}
          </p>
        </div>

        {/* ── Meta Row ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 10,
            fontSize: 13,
            color: '#374151',
            fontFamily: '"Times New Roman", Times, serif',
          }}
        >
          <span>
            <strong>Time Allowed:</strong> {paper.duration || '45 minutes'}
          </span>
          <span>
            <strong>Maximum Marks:</strong> {totalMarks}
          </span>
        </div>

        {/* ── General instruction ── */}
        <p
          style={{
            fontSize: 13,
            color: '#374151',
            marginBottom: 18,
            fontWeight: 600,
            fontFamily: '"Times New Roman", Times, serif',
          }}
        >
          All questions are compulsory unless stated otherwise.
        </p>

        {/* ── Student Fields ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#1A1A1A', fontFamily: '"Times New Roman", Times, serif' }}>
            Name:{' '}
            <span
              style={{ display: 'inline-block', width: 180, borderBottom: '1px solid #374151', marginLeft: 4 }}
            >
              &nbsp;
            </span>
          </div>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#1A1A1A', fontFamily: '"Times New Roman", Times, serif' }}>
            Roll Number:{' '}
            <span
              style={{ display: 'inline-block', width: 140, borderBottom: '1px solid #374151', marginLeft: 4 }}
            >
              &nbsp;
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#1A1A1A', fontFamily: '"Times New Roman", Times, serif' }}>
            Class: {paper.class} Section:{' '}
            <span
              style={{ display: 'inline-block', width: 80, borderBottom: '1px solid #374151', marginLeft: 4 }}
            >
              &nbsp;
            </span>
          </div>
        </div>

        {/* ── Sections ── */}
        {paper.sections.map((section, sIdx) => {
          const sectionLetter = String.fromCharCode(65 + sIdx);
          const questionOffset = paper.sections
            .slice(0, sIdx)
            .reduce((sum, s) => sum + s.questions.length, 0);

          return (
            <div key={sIdx} style={{ marginBottom: 28 }}>
              {/* Section Label */}
              <h2
                style={{
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: 6,
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                Section {sectionLetter}
              </h2>

              {/* Section title + instruction */}
              <div style={{ marginBottom: 10 }}>
                {section.title && (
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1A1A1A',
                      marginBottom: 2,
                      fontFamily: '"Times New Roman", Times, serif',
                    }}
                  >
                    {section.title}
                  </p>
                )}
                {section.instruction && (
                  <p
                    style={{
                      fontSize: 13,
                      fontStyle: 'italic',
                      color: '#6B7280',
                      marginBottom: 8,
                      fontFamily: '"Times New Roman", Times, serif',
                    }}
                  >
                    {section.instruction}
                  </p>
                )}
              </div>

              {/* Questions */}
              <ol style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                {section.questions.map((q, qIdx) => (
                  <QuestionItem
                    key={q.id || qIdx}
                    question={q}
                    number={questionOffset + qIdx + 1}
                  />
                ))}
              </ol>
            </div>
          );
        })}

        {/* ── End of Paper ── */}
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#1A1A1A',
            marginTop: 8,
            marginBottom: 24,
            fontFamily: '"Times New Roman", Times, serif',
          }}
        >
          End of Question Paper
        </p>

        {/* ── Answer Key ── */}
        {allQuestions.some((q) => q.answer) && (
          <div
            style={{
              marginTop: 8,
              borderTop: '2px solid #E5E7EB',
              paddingTop: 20,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#1A1A1A',
                marginBottom: 14,
                fontFamily: '"Times New Roman", Times, serif',
              }}
            >
              Answer Key:
            </h3>
            <ol style={{ listStyle: 'none', paddingLeft: 0 }}>
              {allQuestions.map((q, idx) =>
                q.answer ? (
                  <li
                    key={idx}
                    style={{
                      fontSize: 13.5,
                      color: '#374151',
                      marginBottom: 10,
                      lineHeight: '1.65',
                      fontFamily: '"Times New Roman", Times, serif',
                    }}
                  >
                    {idx + 1}.&nbsp;{q.answer}
                  </li>
                ) : null
              )}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
