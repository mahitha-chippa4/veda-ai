import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  class: string;
  subject: string;
  description?: string;
  studentCount: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    studentCount: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>('Group', GroupSchema);
