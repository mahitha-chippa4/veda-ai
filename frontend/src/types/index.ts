// ─── Question & Paper Types ─────────────────────────────────────────────────

export type QuestionType = 'MCQ' | 'Descriptive' | 'TrueFalse' | 'FillBlanks' | 'ShortAnswer';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Question {
  id?: string;
  question: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  answer?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  _id?: string;
  assignmentId: string;
  title: string;
  subject?: string;
  class?: string;
  schoolName?: string;
  totalMarks?: number;
  duration?: string;
  mcqs: Question[];
  shortQuestions: Question[];
  longQuestions: Question[];
  answerKey: string[];
  pdfUrl?: string;
  generatedAt?: string;
}

// ─── Assignment Types ─────────────────────────────────────────────────────────

export interface QuestionTypeInput {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface Assignment {
  _id: string;
  title: string;
  class: string;
  section: string;
  subject: string;
  schoolName?: string;
  chapters: string[];
  dueDate?: string;
  questionTypes: QuestionTypeInput[];
  additionalInstructions?: string;
  syllabusFile?: string;
  status: AssignmentStatus;
  jobId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface CreateAssignmentFormData {
  title: string;
  class: string;
  section: string;
  subject: string;
  schoolName?: string;
  chapters: string[];
  dueDate?: string;
  questionTypes: QuestionTypeInput[];
  additionalInstructions?: string;
  syllabusFile?: File | null;
}

// ─── WebSocket Event Types ────────────────────────────────────────────────────

export interface WSMessage {
  type: 'generation_started' | 'generation_progress' | 'generation_completed' | 'generation_failed' | 'subscribed';
  assignmentId?: string;
  timestamp?: string;
  data?: {
    progress?: number;
    message?: string;
    paper?: GeneratedPaper;
    error?: string;
  };
}

export interface GenerationState {
  status: JobStatus;
  progress: number;
  message: string;
  paper: GeneratedPaper | null;
  error: string | null;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  cached?: boolean;
}
