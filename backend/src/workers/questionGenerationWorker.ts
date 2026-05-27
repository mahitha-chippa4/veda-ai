import { Worker, Job } from 'bullmq';
import { config } from '../config';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { generateExamPaper } from '../services/geminiService';
import { setCachedPaper, setJobProgress } from '../redis/cache';
import { broadcastToAssignment } from '../websocket/server';

export function startQuestionGenerationWorker(): Worker {
  const worker = new Worker('question-generation', async (job: Job) => {
    const { assignmentId } = job.data;

    console.log(`🔄 Processing question generation job for assignment: ${assignmentId}`);

    // Broadcast: started
    broadcastToAssignment(assignmentId, 'generation_started', { progress: 5, message: 'Starting generation...' });
    await setJobProgress(assignmentId, { jobId: job.id!, assignmentId, status: 'processing', progress: 5, message: 'Starting generation...' });

    const assignmentCheck = await Assignment.findById(assignmentId);
    if (!assignmentCheck) throw new Error(`Assignment ${assignmentId} not found`);
    if (assignmentCheck.status === 'completed' || assignmentCheck.status === 'processing') {
      console.log(`Assignment ${assignmentId} is already ${assignmentCheck.status}. Skipping generation.`);
      return { assignmentId, success: true, skipped: true };
    }

    // Update assignment status
    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status: 'processing', jobId: job.id },
      { new: true }
    );

    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    // Broadcast: fetching data
    broadcastToAssignment(assignmentId, 'generation_progress', { progress: 20, message: 'Preparing prompt...' });
    await setJobProgress(assignmentId, { jobId: job.id!, assignmentId, status: 'processing', progress: 20, message: 'Preparing prompt...' });

    // Call Gemini
    broadcastToAssignment(assignmentId, 'generation_progress', { progress: 40, message: 'Generating questions with AI...' });
    await setJobProgress(assignmentId, { jobId: job.id!, assignmentId, status: 'processing', progress: 40, message: 'Generating questions with AI...' });

    const paperData = await generateExamPaper({
      title: assignment.title,
      subject: assignment.subject,
      class: assignment.class,
      schoolName: assignment.schoolName,
      chapters: assignment.chapters,
      questionTypes: assignment.questionTypes,
      dueDate: assignment.dueDate?.toISOString(),
      additionalInstructions: assignment.additionalInstructions,
      syllabusFile: assignment.syllabusFile,
    });

    // Broadcast: validating
    broadcastToAssignment(assignmentId, 'generation_progress', { progress: 75, message: 'Validating and structuring paper...' });
    await setJobProgress(assignmentId, { jobId: job.id!, assignmentId, status: 'processing', progress: 75, message: 'Validating output...' });

    // Delete old paper if exists
    await GeneratedPaper.deleteOne({ assignmentId });

    // Save to MongoDB
    const paper = new GeneratedPaper({
      assignmentId,
      userId: assignment.userId,
      title: paperData.title,
      subject: paperData.subject,
      class: paperData.class,
      schoolName: (paperData as any).schoolName || assignment.schoolName || '',
      totalMarks: paperData.totalMarks,
      duration: paperData.duration,
      mcqs: paperData.mcqs,
      shortQuestions: paperData.shortQuestions,
      longQuestions: paperData.longQuestions,
      answerKey: paperData.answerKey,
    });
    await paper.save();

    // Cache in Redis
    await setCachedPaper(assignmentId, paperData);

    // Update assignment status
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });

    // Broadcast: completed
    broadcastToAssignment(assignmentId, 'generation_completed', {
      progress: 100,
      message: 'Paper generated successfully!',
      paper: paperData,
    });
    await setJobProgress(assignmentId, { jobId: job.id!, assignmentId, status: 'completed', progress: 100, message: 'Paper generated!' });

    console.log(`✅ Question generation completed for assignment: ${assignmentId}`);
    return { assignmentId, success: true };
  }, {
    connection: { url: config.redisUrl },
    concurrency: 2,
  });

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId } = job.data;
    console.error(`❌ Job failed for assignment ${assignmentId}:`, err.message);

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'failed',
      errorMessage: err.message,
    });

    broadcastToAssignment(assignmentId, 'generation_failed', {
      progress: 0,
      message: 'Generation failed. Please try again.',
      error: err.message,
    });

    await setJobProgress(assignmentId, {
      jobId: job.id!,
      assignmentId,
      status: 'failed',
      progress: 0,
      message: 'Generation failed',
      error: err.message,
    });
  });

  console.log('🚀 QuestionGenerationWorker started');
  return worker;
}
