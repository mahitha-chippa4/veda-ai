import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { questionQueue } from '../queues';
import { getCachedPaper, invalidatePaperCache } from '../redis/cache';
import { AuthRequest } from '../middleware/auth';

export async function createAssignment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const {
      title, class: className, section, subject, schoolName,
      chapters, dueDate, questionTypes, additionalInstructions
    } = req.body;

    const syllabusFile = (req.file as Express.Multer.File)?.path;

    const parsedQuestionTypes = typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes;
    const chaptersArray = Array.isArray(chapters) ? chapters : (chapters ? [chapters] : []);

    const hashData = {
      title, class: className, subject, chapters: chaptersArray, 
      questionTypes: parsedQuestionTypes, additionalInstructions, syllabusFileOriginalName: req.file?.originalname
    };
    const settingsHash = crypto.createHash('sha256').update(JSON.stringify(hashData)).digest('hex');

    if (!syllabusFile) {
      const existingAssignment = await Assignment.findOne({ settingsHash });
      if (existingAssignment) {
        if (existingAssignment.status === 'completed' || existingAssignment.status === 'processing' || existingAssignment.status === 'pending') {
          return res.status(200).json({
            success: true,
            data: {
              assignment: existingAssignment,
              jobId: existingAssignment.jobId || null,
            },
          });
        }
      }
    }

    const assignment = new Assignment({
      title,
      class: className,
      section,
      subject,
      schoolName: schoolName || '',
      chapters: chaptersArray,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      questionTypes: parsedQuestionTypes,
      additionalInstructions,
      syllabusFile,
      settingsHash,
      status: 'pending',
      userId: req.user?.id,
    });

    await assignment.save();

    // Enqueue question generation job
    const job = await questionQueue.add('generate', { assignmentId: assignment._id.toString() }, {
      jobId: `gen-${assignment._id}`,
      attempts: 1,
    });

    assignment.jobId = job.id;
    await assignment.save();

    res.status(201).json({
      success: true,
      data: {
        assignment,
        jobId: job.id,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const assignments = await Assignment.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
}

export async function getAssignment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findOne({ _id: id, userId: req.user?.id });
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
}

export async function deleteAssignment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findOneAndDelete({ _id: id, userId: req.user?.id });
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    await GeneratedPaper.deleteOne({ assignmentId: id as string });
    await invalidatePaperCache(id as string);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
}

export async function regenerateAssignment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findOne({ _id: id, userId: req.user?.id });
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    // Invalidate cache
    await invalidatePaperCache(id as string);
    await GeneratedPaper.deleteOne({ assignmentId: id as string });

    // Reset status
    assignment.status = 'pending';
    assignment.errorMessage = undefined;
    await assignment.save();

    // Re-enqueue
    const job = await questionQueue.add('generate', { assignmentId: id }, {
      jobId: `regen-${id}-${Date.now()}`,
      attempts: 1,
    });

    res.json({ success: true, data: { jobId: job.id } });
  } catch (error) {
    next(error);
  }
}

export async function getPaper(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { assignmentId } = req.params;

    // Check Redis cache first
    const cached = await getCachedPaper(assignmentId as string);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Fallback to MongoDB
    const paper = await GeneratedPaper.findOne({ assignmentId, userId: req.user?.id });
    if (!paper) {
      return res.status(404).json({ success: false, error: 'Paper not generated yet' });
    }

    res.json({ success: true, data: paper, cached: false });
  } catch (error) {
    next(error);
  }
}
