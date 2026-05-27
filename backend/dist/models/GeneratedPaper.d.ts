import mongoose, { Document } from 'mongoose';
import { Section } from '../types';
export interface IGeneratedPaper extends Document {
    assignmentId: mongoose.Types.ObjectId;
    title: string;
    subject?: string;
    class?: string;
    schoolName?: string;
    totalMarks?: number;
    duration?: string;
    sections: Section[];
    pdfUrl?: string;
    version: number;
    userId: mongoose.Types.ObjectId;
    generatedAt: Date;
}
export declare const GeneratedPaper: mongoose.Model<IGeneratedPaper, {}, {}, {}, mongoose.Document<unknown, {}, IGeneratedPaper, {}, mongoose.DefaultSchemaOptions> & IGeneratedPaper & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGeneratedPaper>;
//# sourceMappingURL=GeneratedPaper.d.ts.map