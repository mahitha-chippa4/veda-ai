"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startQuestionGenerationWorker = startQuestionGenerationWorker;
const bullmq_1 = require("bullmq");
const config_1 = require("../config");
const Assignment_1 = require("../models/Assignment");
const GeneratedPaper_1 = require("../models/GeneratedPaper");
const geminiService_1 = require("../services/geminiService");
const cache_1 = require("../redis/cache");
const server_1 = require("../websocket/server");
function startQuestionGenerationWorker() {
    const worker = new bullmq_1.Worker('question-generation', async (job) => {
        const { assignmentId } = job.data;
        console.log(`🔄 Processing question generation job for assignment: ${assignmentId}`);
        // Broadcast: started
        (0, server_1.broadcastToAssignment)(assignmentId, 'generation_started', { progress: 5, message: 'Starting generation...' });
        await (0, cache_1.setJobProgress)(assignmentId, { jobId: job.id, assignmentId, status: 'processing', progress: 5, message: 'Starting generation...' });
        // Update assignment status
        const assignment = await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: 'processing', jobId: job.id }, { new: true });
        if (!assignment) {
            throw new Error(`Assignment ${assignmentId} not found`);
        }
        // Broadcast: fetching data
        (0, server_1.broadcastToAssignment)(assignmentId, 'generation_progress', { progress: 20, message: 'Preparing prompt...' });
        await (0, cache_1.setJobProgress)(assignmentId, { jobId: job.id, assignmentId, status: 'processing', progress: 20, message: 'Preparing prompt...' });
        // Call Gemini
        (0, server_1.broadcastToAssignment)(assignmentId, 'generation_progress', { progress: 40, message: 'Generating questions with AI...' });
        await (0, cache_1.setJobProgress)(assignmentId, { jobId: job.id, assignmentId, status: 'processing', progress: 40, message: 'Generating questions with AI...' });
        const paperData = await (0, geminiService_1.generateExamPaper)({
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
        (0, server_1.broadcastToAssignment)(assignmentId, 'generation_progress', { progress: 75, message: 'Validating and structuring paper...' });
        await (0, cache_1.setJobProgress)(assignmentId, { jobId: job.id, assignmentId, status: 'processing', progress: 75, message: 'Validating output...' });
        // Delete old paper if exists
        await GeneratedPaper_1.GeneratedPaper.deleteOne({ assignmentId });
        // Save to MongoDB
        const paper = new GeneratedPaper_1.GeneratedPaper({
            assignmentId,
            userId: assignment.userId,
            title: paperData.title,
            subject: paperData.subject,
            class: paperData.class,
            schoolName: paperData.schoolName || assignment.schoolName || '',
            totalMarks: paperData.totalMarks,
            duration: paperData.duration,
            sections: paperData.sections,
        });
        await paper.save();
        // Cache in Redis
        await (0, cache_1.setCachedPaper)(assignmentId, paperData);
        // Update assignment status
        await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
        // Broadcast: completed
        (0, server_1.broadcastToAssignment)(assignmentId, 'generation_completed', {
            progress: 100,
            message: 'Paper generated successfully!',
            paper: paperData,
        });
        await (0, cache_1.setJobProgress)(assignmentId, { jobId: job.id, assignmentId, status: 'completed', progress: 100, message: 'Paper generated!' });
        console.log(`✅ Question generation completed for assignment: ${assignmentId}`);
        return { assignmentId, success: true };
    }, {
        connection: { url: config_1.config.redisUrl },
        concurrency: 2,
    });
    worker.on('failed', async (job, err) => {
        if (!job)
            return;
        const { assignmentId } = job.data;
        console.error(`❌ Job failed for assignment ${assignmentId}:`, err.message);
        await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, {
            status: 'failed',
            errorMessage: err.message,
        });
        (0, server_1.broadcastToAssignment)(assignmentId, 'generation_failed', {
            progress: 0,
            message: 'Generation failed. Please try again.',
            error: err.message,
        });
        await (0, cache_1.setJobProgress)(assignmentId, {
            jobId: job.id,
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
//# sourceMappingURL=questionGenerationWorker.js.map