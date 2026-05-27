'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Check, AlertCircle, Upload, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { TopicPills } from '@/components/form/TopicPills';
import { QuestionTypesTable } from '@/components/form/QuestionTypesTable';
import { useAssignmentStore } from '@/store/assignmentStore';
import { assignmentApi } from '@/services/api';

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  schoolName: z.string().optional(),
  class: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  subject: z.string().min(1, 'Subject is required'),
  chapters: z.array(z.string()).min(1, 'Add at least one chapter'),
  dueDate: z.string().optional(),
  questionTypes: z
    .array(z.object({ type: z.string(), count: z.number(), marks: z.number() }))
    .min(1, 'Add at least one question type'),
  additionalInstructions: z.string().optional(),
  syllabusFile: z.instanceof(File).nullable().optional(),
});

type FormData = z.infer<typeof schema>;

const CLASS_OPTIONS = [
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6',
  'Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12',
];
const SECTION_OPTIONS = ['A','B','C','D','E'];
const SUBJECT_OPTIONS = [
  'Mathematics','Science','Physics','Chemistry','Biology',
  'English','History','Geography','Computer Science','Economics',
];
const SUBJECT_CHAPTERS: Record<string, string[]> = {
  Mathematics: ['Algebra','Geometry','Calculus','Statistics','Trigonometry','Number Theory'],
  Science: ['Motion','Force','Energy','Heat','Light','Sound','Electricity'],
  Physics: ['Mechanics','Thermodynamics','Optics','Electromagnetism','Modern Physics'],
  Chemistry: ['Atomic Structure','Periodic Table','Chemical Bonding','Organic Chemistry'],
  Biology: ['Cell Biology','Genetics','Evolution','Ecology','Human Physiology'],
  English: ['Grammar','Comprehension','Essay Writing','Literature','Poetry'],
  History: ['Ancient Civilizations','Medieval Period','Modern History','World Wars'],
  Geography: ['Physical Geography','Human Geography','Climate','Resources'],
  'Computer Science': ['Programming','Data Structures','Algorithms','Databases','Networking'],
  Economics: ['Micro Economics','Macro Economics','International Trade','Development Economics'],
};

const STEPS = ['Basic Info', 'Content', 'Questions', 'Review'];

// ─── Field helpers ────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="field-label">
      {children}
      {required && <span style={{ color: '#FF5A1F', marginLeft: 2 }}>*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{msg}</p>;
}

function StyledSelect({ value, onChange, options, placeholder, error }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 14,
          color: value ? '#1A1A1A' : '#9CA3AF',
          backgroundColor: '#FFFFFF',
          border: `1.5px solid ${error ? '#DC2626' : '#E5E7EB'}`,
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 36,
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          (e.target as HTMLElement).style.borderColor = '#FF5A1F';
          (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(255,90,31,0.12)';
        }}
        onBlur={(e) => {
          (e.target as HTMLElement).style.borderColor = error ? '#DC2626' : '#E5E7EB';
          (e.target as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <FieldError msg={error} />
    </div>
  );
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { addAssignment } = useAssignmentStore();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitLock = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      schoolName: '',
      class: '',
      section: '',
      subject: '',
      chapters: [],
      dueDate: '',
      questionTypes: [
        { type: 'MCQ', count: 10, marks: 2 },
        { type: 'ShortAnswer', count: 5, marks: 4 },
      ],
      additionalInstructions: '',
      syllabusFile: null,
    },
    mode: 'onChange',
  });

  const watchedSubject = watch('subject');
  const watchedTypes = watch('questionTypes');
  const totalQ = watchedTypes?.reduce((s, t) => s + (t.count || 0), 0) || 0;
  const totalM = watchedTypes?.reduce((s, t) => s + (t.count || 0) * (t.marks || 0), 0) || 0;

  const stepFields: Record<number, (keyof FormData)[]> = {
    0: ['title', 'schoolName', 'class', 'section', 'subject'],
    1: ['chapters', 'dueDate'],
    2: ['questionTypes'],
    3: [],
  };

  const next = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid && step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const onSubmit = async (data: FormData) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append('title', data.title);
      if (data.schoolName) fd.append('schoolName', data.schoolName);
      fd.append('class', data.class);
      fd.append('section', data.section);
      fd.append('subject', data.subject);
      data.chapters.forEach((c) => fd.append('chapters', c));
      if (data.dueDate) fd.append('dueDate', data.dueDate);
      fd.append('questionTypes', JSON.stringify(data.questionTypes));
      if (data.additionalInstructions) fd.append('additionalInstructions', data.additionalInstructions);
      if (data.syllabusFile) fd.append('syllabusFile', data.syllabusFile);

      const result = await assignmentApi.create(fd);
      addAssignment(result.assignment);
      router.push(`/assignments/${result.assignment._id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create assignment');
      setIsSubmitting(false);
    } finally {
      submitLock.current = false;
    }
  };

  return (
    <AppShell showBack title="Assignment">
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px 60px' }}>
        {/* ── Page Header ── */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#1A1A1A',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              marginBottom: 4,
            }}
          >
            Create Assignment
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            Fill in the details to generate your AI-powered question paper.
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: i < step ? 'pointer' : 'default',
                  flexShrink: 0,
                }}
                onClick={() => i < step && setStep(i)}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    backgroundColor:
                      i < step ? '#FF5A1F' : i === step ? '#1A1A1A' : '#F3F4F6',
                    color: i <= step ? '#FFFFFF' : '#9CA3AF',
                    boxShadow:
                      i === step ? '0 0 0 4px rgba(26,26,26,0.1)' : 'none',
                  }}
                >
                  {i < step ? <Check size={15} /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: i === step ? 600 : 400,
                    color: i === step ? '#1A1A1A' : '#9CA3AF',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: i < step ? '#FF5A1F' : '#E5E7EB',
                    marginTop: -14,
                    marginLeft: 4,
                    marginRight: 4,
                    transition: 'background-color 0.2s',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Form Card ── */}
        <div className="card" style={{ padding: '28px 28px' }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AnimatePresence mode="wait">
              {/* ── Step 0: Basic Info ── */}
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
                    Basic Information
                  </h2>

                  <div>
                    <FieldLabel required>Assignment Title</FieldLabel>
                    <input
                      {...register('title')}
                      placeholder="e.g. Mid-term Mathematics Exam"
                      className="input-field"
                      style={{ borderColor: errors.title ? '#DC2626' : undefined }}
                    />
                    <FieldError msg={errors.title?.message} />
                  </div>

                  <div>
                    <FieldLabel>School / Institution Name</FieldLabel>
                    <input
                      {...register('schoolName')}
                      placeholder="e.g. Delhi Public School, Sector-4"
                      className="input-field"
                    />
                    <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>
                      This will appear as the header on your question paper.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>Class</FieldLabel>
                      <Controller
                        name="class"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            {...field}
                            options={CLASS_OPTIONS}
                            placeholder="Select class"
                            error={errors.class?.message}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Section</FieldLabel>
                      <Controller
                        name="section"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            {...field}
                            options={SECTION_OPTIONS.map((s) => `Section ${s}`)}
                            placeholder="Select section"
                            error={errors.section?.message}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Subject</FieldLabel>
                    <Controller
                      name="subject"
                      control={control}
                      render={({ field }) => (
                        <StyledSelect
                          {...field}
                          options={SUBJECT_OPTIONS}
                          placeholder="Select subject"
                          error={errors.subject?.message}
                        />
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Content ── */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
                    Assignment Details
                  </h2>
                  <p style={{ fontSize: 13, color: '#6B7280', marginTop: -12 }}>Basic information about your assignment</p>

                  {/* File upload */}
                  <div>
                    <Controller
                      name="syllabusFile"
                      control={control}
                      render={({ field }) => (
                        <div
                          style={{
                            border: '2px dashed #D1D5DB',
                            borderRadius: 12,
                            padding: '32px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: field.value ? '#FFF0EB' : 'white',
                            borderColor: field.value ? '#FF5A1F' : '#D1D5DB',
                            transition: 'all 0.15s',
                          }}
                          onClick={() => document.getElementById('syllabus-file-input')?.click()}
                        >
                          {field.value ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                              <Upload size={16} color="#FF5A1F" />
                              <p style={{ fontSize: 13.5, color: '#FF5A1F', fontWeight: 600 }}>
                                {(field.value as File).name}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); field.onChange(null); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload size={24} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
                              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>
                                Choose a file or drag &amp; drop it here
                              </p>
                              <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>JPEG, PNG, PDF, DOC, upto 10MB</p>
                              <button
                                type="button"
                                style={{
                                  padding: '8px 20px',
                                  backgroundColor: 'white',
                                  border: '1px solid #D1D5DB',
                                  borderRadius: 20,
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: '#374151',
                                  cursor: 'pointer',
                                }}
                              >
                                Browse Files
                              </button>
                            </>
                          )}
                          <input
                            id="syllabus-file-input"
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                          />
                        </div>
                      )}
                    />
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}>Upload images of your preferred document/image</p>
                  </div>

                  {/* Due Date */}
                  <div>
                    <FieldLabel>Due Date</FieldLabel>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="date"
                        {...register('dueDate')}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                        style={{ paddingRight: 40 }}
                      />
                    </div>
                  </div>

                  {/* Chapters/Topics */}
                  <div>
                    <Controller
                      name="chapters"
                      control={control}
                      render={({ field }) => (
                        <TopicPills
                          label="Chapters / Topics"
                          value={field.value}
                          onChange={field.onChange}
                          suggestions={SUBJECT_CHAPTERS[watchedSubject] || []}
                          error={errors.chapters?.message}
                          placeholder="Type chapter name and press Enter..."
                        />
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Question Types ── */}
              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>
                    Question Type
                  </h2>
                  {/* Gray background wrapper to match the screenshot */}
                  <div style={{ backgroundColor: '#F3F4F6', borderRadius: 16, padding: 24 }}>
                    <Controller
                      name="questionTypes"
                      control={control}
                      render={({ field }) => (
                        <QuestionTypesTable
                          value={field.value as any}
                          onChange={field.onChange as any}
                          error={errors.questionTypes?.message}
                        />
                      )}
                    />
                  </div>

                  {/* Additional Information */}
                  <div>
                    <FieldLabel>Additional Information (For better output)</FieldLabel>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        {...register('additionalInstructions')}
                        placeholder="e.g Generate a question paper for 3 hour exam duration..."
                        rows={3}
                        className="input-field"
                        style={{ resize: 'none', paddingRight: 44 }}
                      />
                      <span style={{ position: 'absolute', right: 14, bottom: 14, color: '#9CA3AF' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
                    Review &amp; Confirm
                  </h2>

                  {/* Summary */}
                  <div
                    style={{
                      backgroundColor: '#FFF7F4',
                      border: '1px solid #FFD6C4',
                      borderRadius: 10,
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Sparkles size={15} color="#FF5A1F" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FF5A1F' }}>
                        Generation Summary
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-5">
                      {[
                        ['School', watch('schoolName') || '(Not set)'],
                        ['Subject', watch('subject') || '—'],
                        ['Class', `${watch('class')} ${watch('section') ? '- ' + watch('section') : ''}`],
                        ['Due Date', watch('dueDate') ? new Date(watch('dueDate')!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '(Not set)'],
                        ['Total Questions', String(totalQ)],
                        ['Total Marks', String(totalM)],
                        ['Chapters', watch('chapters')?.join(', ') || '—'],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{k}</span>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A1A', marginTop: 1 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {submitError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: 10,
                        fontSize: 13.5,
                        color: '#DC2626',
                      }}
                    >
                      <AlertCircle size={16} />
                      {submitError}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Navigation ── */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid #F3F4F6',
              }}
            >
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  backgroundColor: 'transparent',
                  color: step === 0 ? '#D1D5DB' : '#6B7280',
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 500,
                  border: '1.5px solid',
                  borderColor: step === 0 ? '#F3F4F6' : '#E5E7EB',
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>

              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                Step {step + 1} of {STEPS.length}
              </span>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 22px',
                    backgroundColor: '#1A1A1A',
                    color: '#FFFFFF',
                    borderRadius: 9999,
                    fontSize: 14,
                    fontWeight: 600,
                    border: '1.5px solid #1A1A1A',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#2D2D2D')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#1A1A1A')}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 24px',
                    backgroundColor: isSubmitting ? '#9CA3AF' : '#FF5A1F',
                    color: '#FFFFFF',
                    borderRadius: 9999,
                    fontSize: 14,
                    fontWeight: 700,
                    border: 'none',
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(255,90,31,0.3)',
                  }}
                >
                  <Sparkles size={15} />
                  {isSubmitting ? 'Generating...' : 'Generate Paper'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
