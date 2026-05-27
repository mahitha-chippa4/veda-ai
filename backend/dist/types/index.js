"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedPaperSchema = exports.SectionSchema = exports.QuestionSchema = void 0;
const zod_1 = require("zod");
exports.QuestionSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    question: zod_1.z.string().min(1),
    type: zod_1.z.enum(['MCQ', 'Descriptive', 'TrueFalse', 'FillBlanks', 'ShortAnswer']),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']),
    marks: zod_1.z.number().positive(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    answer: zod_1.z.string().optional(),
});
exports.SectionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    instruction: zod_1.z.string(),
    questions: zod_1.z.array(exports.QuestionSchema),
});
exports.GeneratedPaperSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    schoolName: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    class: zod_1.z.string().optional(),
    totalMarks: zod_1.z.number().optional(),
    duration: zod_1.z.string().optional(),
    sections: zod_1.z.array(exports.SectionSchema),
});
//# sourceMappingURL=index.js.map