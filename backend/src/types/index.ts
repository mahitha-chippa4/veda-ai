import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1),
  type: z.enum(['MCQ', 'Descriptive', 'TrueFalse', 'FillBlanks', 'ShortAnswer']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().positive(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
});

export const SectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string(),
  questions: z.array(QuestionSchema),
});

export const GeneratedPaperSchema = z.object({
  title: z.string().min(1),
  schoolName: z.string().optional(),
  subject: z.string().optional(),
  class: z.string().optional(),
  totalMarks: z.number().optional(),
  duration: z.string().optional(),
  sections: z.array(SectionSchema),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type GeneratedPaperData = z.infer<typeof GeneratedPaperSchema>;

export interface QuestionTypeInput {
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  class: string;
  section: string;
  subject: string;
  chapters: string[];
  dueDate?: string;
  questionTypes: QuestionTypeInput[];
  additionalInstructions?: string;
  syllabusFile?: string;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobProgress {
  jobId: string;
  assignmentId: string;
  status: JobStatus;
  progress: number;
  message: string;
  error?: string;
}
