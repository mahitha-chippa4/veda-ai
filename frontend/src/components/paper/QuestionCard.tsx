'use client';

import { Question } from '@/types';

interface QuestionItemProps {
  question: Question;
  number: number;
}

const DIFFICULTY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: 'Easy', color: '#15803D', bg: '#DCFCE7' },
  medium: { label: 'Moderate', color: '#92400E', bg: '#FEF3C7' },
  hard: { label: 'Hard', color: '#991B1B', bg: '#FEE2E2' },
};

export function QuestionItem({ question, number }: QuestionItemProps) {
  const diff = DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.medium;

  return (
    <li style={{ marginBottom: 12, lineHeight: '1.7' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
        {/* Number */}
        <span style={{ fontSize: 13.5, color: '#1A1A1A', minWidth: 24, flexShrink: 0 }}>
          {number}.
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Question line */}
          <span style={{ fontSize: 13.5, color: '#1A1A1A' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 600,
                color: diff.color,
                backgroundColor: diff.bg,
                borderRadius: 4,
                padding: '1px 6px',
                marginRight: 6,
                verticalAlign: 'middle',
                lineHeight: '18px',
              }}
            >
              {diff.label}
            </span>
            {question.question}
            <span style={{ marginLeft: 6, fontSize: 13, color: '#374151', fontWeight: 500 }}>
              [{question.marks} Mark{question.marks !== 1 ? 's' : ''}]
            </span>
          </span>

          {/* MCQ options */}
          {question.type === 'MCQ' && question.options && question.options.length > 0 && (
            <div style={{ marginTop: 6, paddingLeft: 0 }}>
              {question.options.map((opt, i) => (
                <div key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* True/False */}
          {question.type === 'TrueFalse' && (
            <div style={{ marginTop: 4, fontSize: 13, color: '#374151' }}>
              (a) True &nbsp;&nbsp; (b) False
            </div>
          )}

          {/* Fill in the blanks */}
          {question.type === 'FillBlanks' && (
            <div style={{ marginTop: 4 }}>
              <span style={{ display: 'inline-block', width: 200, borderBottom: '1px solid #9CA3AF' }}>&nbsp;</span>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
