import { z } from 'zod';
export declare const QuestionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    question: z.ZodString;
    type: z.ZodEnum<{
        MCQ: "MCQ";
        Descriptive: "Descriptive";
        TrueFalse: "TrueFalse";
        FillBlanks: "FillBlanks";
        ShortAnswer: "ShortAnswer";
    }>;
    difficulty: z.ZodEnum<{
        easy: "easy";
        medium: "medium";
        hard: "hard";
    }>;
    marks: z.ZodNumber;
    options: z.ZodOptional<z.ZodArray<z.ZodString>>;
    answer: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const SectionSchema: z.ZodObject<{
    title: z.ZodString;
    instruction: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        question: z.ZodString;
        type: z.ZodEnum<{
            MCQ: "MCQ";
            Descriptive: "Descriptive";
            TrueFalse: "TrueFalse";
            FillBlanks: "FillBlanks";
            ShortAnswer: "ShortAnswer";
        }>;
        difficulty: z.ZodEnum<{
            easy: "easy";
            medium: "medium";
            hard: "hard";
        }>;
        marks: z.ZodNumber;
        options: z.ZodOptional<z.ZodArray<z.ZodString>>;
        answer: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const GeneratedPaperSchema: z.ZodObject<{
    title: z.ZodString;
    schoolName: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    class: z.ZodOptional<z.ZodString>;
    totalMarks: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodString>;
    sections: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        instruction: z.ZodString;
        questions: z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            question: z.ZodString;
            type: z.ZodEnum<{
                MCQ: "MCQ";
                Descriptive: "Descriptive";
                TrueFalse: "TrueFalse";
                FillBlanks: "FillBlanks";
                ShortAnswer: "ShortAnswer";
            }>;
            difficulty: z.ZodEnum<{
                easy: "easy";
                medium: "medium";
                hard: "hard";
            }>;
            marks: z.ZodNumber;
            options: z.ZodOptional<z.ZodArray<z.ZodString>>;
            answer: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
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
//# sourceMappingURL=index.d.ts.map