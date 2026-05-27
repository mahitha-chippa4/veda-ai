import { GeneratedPaperData, QuestionTypeInput } from '../types';
interface GenerationInput {
    title: string;
    subject: string;
    class: string;
    schoolName?: string;
    chapters: string[];
    questionTypes: QuestionTypeInput[];
    dueDate?: string;
    additionalInstructions?: string;
    syllabusFile?: string;
}
export declare function generateExamPaper(input: GenerationInput): Promise<GeneratedPaperData>;
export {};
//# sourceMappingURL=geminiService.d.ts.map