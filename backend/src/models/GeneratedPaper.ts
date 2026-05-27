import mongoose, { Document, Schema } from 'mongoose';
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

const QuestionSchema = new Schema({
  id: String,
  question: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  marks: { type: Number, required: true },
  options: [String],
  answer: String,
}, { _id: false });

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, default: '' },
  questions: [QuestionSchema],
}, { _id: false });

const GeneratedPaperSchema = new Schema<IGeneratedPaper>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: String,
  class: String,
  schoolName: String,
  totalMarks: Number,
  duration: String,
  sections: [SectionSchema],
  pdfUrl: String,
  version: { type: Number, default: 1 },
  generatedAt: { type: Date, default: Date.now },
});

export const GeneratedPaper = mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);
