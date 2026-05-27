'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { QuestionType, QuestionTypeInput } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTION_TYPES: { value: QuestionType; label: string; color: string }[] = [
  { value: 'MCQ', label: 'Multiple Choice', color: 'text-blue-600 bg-blue-50' },
  { value: 'Descriptive', label: 'Descriptive', color: 'text-purple-600 bg-purple-50' },
  { value: 'TrueFalse', label: 'True / False', color: 'text-emerald-600 bg-emerald-50' },
  { value: 'FillBlanks', label: 'Fill in Blanks', color: 'text-amber-600 bg-amber-50' },
  { value: 'ShortAnswer', label: 'Short Answer', color: 'text-rose-600 bg-rose-50' },
];

interface QuestionTypesTableProps {
  value: QuestionTypeInput[];
  onChange: (types: QuestionTypeInput[]) => void;
  error?: string;
}

function Stepper({ value, onChange, min = 0, max = 50 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'white', borderRadius: 20, padding: '4px 12px' }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 16, fontWeight: 500, padding: 0 }}
      >
        -
      </button>
      <span style={{ width: 20, textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 16, fontWeight: 500, padding: 0 }}
      >
        +
      </button>
    </div>
  );
}

export function QuestionTypesTable({ value, onChange, error }: QuestionTypesTableProps) {
  const addType = () => {
    const existing = value.map(v => v.type);
    const next = QUESTION_TYPES.find(qt => !existing.includes(qt.value));
    if (!next) return;
    onChange([...value, { type: next.value, count: 5, marks: 2 }]);
  };

  const removeType = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateType = (index: number, updates: Partial<QuestionTypeInput>) => {
    onChange(value.map((qt, i) => i === index ? { ...qt, ...updates } : qt));
  };

  const availableTypes = QUESTION_TYPES.filter(qt => !value.map(v => v.type).includes(qt.value));

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 24, marginBottom: 12, paddingRight: 8 }}>
        <label style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>Question Type</label>
        <label style={{ fontSize: 14, fontWeight: 700, color: '#374151', textAlign: 'center' }}>No. of Questions</label>
        <label style={{ fontSize: 14, fontWeight: 700, color: '#374151', textAlign: 'center' }}>Marks</label>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AnimatePresence initial={false}>
          {value.map((qt, index) => {
            return (
              <motion.div
                key={`${qt.type}-${index}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                {/* Type selector (White pill) */}
                <div style={{ flex: 1, backgroundColor: 'white', borderRadius: 999, padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={qt.type}
                    onChange={(e) => updateType(index, { type: e.target.value as QuestionType })}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#1A1A1A',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={qt.type}>{QUESTION_TYPES.find(t => t.value === qt.type)?.label || qt.type}</option>
                    {availableTypes.map(at => (
                      <option key={at.value} value={at.value}>{at.label}</option>
                    ))}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ marginLeft: 'auto', pointerEvents: 'none' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {/* Remove Cross */}
                <button
                  type="button"
                  onClick={() => removeType(index)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', display: 'flex', padding: 8 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>

                {/* Questions stepper (White pill) */}
                <Stepper value={qt.count} onChange={(v) => updateType(index, { count: v })} />

                {/* Marks stepper (White pill) */}
                <Stepper value={qt.marks} onChange={(v) => updateType(index, { marks: v })} min={1} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <button
          type="button"
          onClick={addType}
          disabled={availableTypes.length === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: 'none',
            border: 'none',
            color: '#1A1A1A',
            fontSize: 14,
            fontWeight: 700,
            cursor: availableTypes.length === 0 ? 'not-allowed' : 'pointer',
            opacity: availableTypes.length === 0 ? 0.5 : 1
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1A1A1A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} />
          </div>
          Add Question Type
        </button>

        {value.length > 0 && (
          <div style={{ textAlign: 'right', color: '#1A1A1A', fontSize: 14, fontWeight: 500, lineHeight: 1.8 }}>
            <div>Total Questions : {value.reduce((sum, qt) => sum + qt.count, 0)}</div>
            <div>Total Marks : {value.reduce((sum, qt) => sum + qt.count * qt.marks, 0)}</div>
          </div>
        )}
      </div>

      {error && <p style={{ marginTop: 8, fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</p>}
    </div>
  );
}
