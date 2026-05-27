import mongoose, { Document } from 'mongoose';
import { QuestionTypeInput } from '../types';
export interface IAssignment extends Document {
    title: string;
    class: string;
    section: string;
    subject: string;
    schoolName?: string;
    chapters: string[];
    dueDate?: Date;
    questionTypes: QuestionTypeInput[];
    additionalInstructions?: string;
    syllabusFile?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    jobId?: string;
    errorMessage?: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Assignment: mongoose.Model<IAssignment, {}, {}, {}, mongoose.Document<unknown, {}, IAssignment, {}, mongoose.DefaultSchemaOptions> & IAssignment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAssignment>;
//# sourceMappingURL=Assignment.d.ts.map