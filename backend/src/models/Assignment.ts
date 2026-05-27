import mongoose, { Document, Schema } from 'mongoose';
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
  settingsHash?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<QuestionTypeInput>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 0 },
  marks: { type: Number, required: true, min: 0 },
}, { _id: false });

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true, trim: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  schoolName: { type: String, default: '' },
  chapters: [{ type: String }],
  dueDate: { type: Date },
  questionTypes: [QuestionTypeSchema],
  additionalInstructions: { type: String },
  syllabusFile: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  jobId: { type: String },
  errorMessage: { type: String },
  settingsHash: { type: String, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
