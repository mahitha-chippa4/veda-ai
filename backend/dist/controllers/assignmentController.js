"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignment = createAssignment;
exports.getAssignments = getAssignments;
exports.getAssignment = getAssignment;
exports.deleteAssignment = deleteAssignment;
exports.regenerateAssignment = regenerateAssignment;
exports.getPaper = getPaper;
const Assignment_1 = require("../models/Assignment");
const GeneratedPaper_1 = require("../models/GeneratedPaper");
const queues_1 = require("../queues");
const cache_1 = require("../redis/cache");
async function createAssignment(req, res, next) {
    try {
        const { title, class: className, section, subject, schoolName, chapters, dueDate, questionTypes, additionalInstructions } = req.body;
        const syllabusFile = req.file?.path;
        const assignment = new Assignment_1.Assignment({
            title,
            class: className,
            section,
            subject,
            schoolName: schoolName || '',
            chapters: Array.isArray(chapters) ? chapters : (chapters ? [chapters] : []),
            dueDate: dueDate ? new Date(dueDate) : undefined,
            questionTypes: typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes,
            additionalInstructions,
            syllabusFile,
            status: 'pending',
            userId: req.user?.id,
        });
        await assignment.save();
        // Enqueue question generation job
        const job = await queues_1.questionQueue.add('generate', { assignmentId: assignment._id.toString() }, {
            jobId: `gen-${assignment._id}`,
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
    }
    catch (error) {
        next(error);
    }
}
async function getAssignments(req, res, next) {
    try {
        const assignments = await Assignment_1.Assignment.find({ userId: req.user?.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: assignments });
    }
    catch (error) {
        next(error);
    }
}
async function getAssignment(req, res, next) {
    try {
        const { id } = req.params;
        const assignment = await Assignment_1.Assignment.findOne({ _id: id, userId: req.user?.id });
        if (!assignment) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }
        res.json({ success: true, data: assignment });
    }
    catch (error) {
        next(error);
    }
}
async function deleteAssignment(req, res, next) {
    try {
        const { id } = req.params;
        const assignment = await Assignment_1.Assignment.findOneAndDelete({ _id: id, userId: req.user?.id });
        if (!assignment) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }
        await GeneratedPaper_1.GeneratedPaper.deleteOne({ assignmentId: id });
        await (0, cache_1.invalidatePaperCache)(id);
        res.json({ success: true, message: 'Assignment deleted' });
    }
    catch (error) {
        next(error);
    }
}
async function regenerateAssignment(req, res, next) {
    try {
        const { id } = req.params;
        const assignment = await Assignment_1.Assignment.findOne({ _id: id, userId: req.user?.id });
        if (!assignment) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }
        // Invalidate cache
        await (0, cache_1.invalidatePaperCache)(id);
        await GeneratedPaper_1.GeneratedPaper.deleteOne({ assignmentId: id });
        // Reset status
        assignment.status = 'pending';
        assignment.errorMessage = undefined;
        await assignment.save();
        // Re-enqueue
        const job = await queues_1.questionQueue.add('generate', { assignmentId: id }, {
            jobId: `regen-${id}-${Date.now()}`,
        });
        res.json({ success: true, data: { jobId: job.id } });
    }
    catch (error) {
        next(error);
    }
}
async function getPaper(req, res, next) {
    try {
        const { assignmentId } = req.params;
        // Check Redis cache first
        const cached = await (0, cache_1.getCachedPaper)(assignmentId);
        if (cached) {
            return res.json({ success: true, data: cached, cached: true });
        }
        // Fallback to MongoDB
        const paper = await GeneratedPaper_1.GeneratedPaper.findOne({ assignmentId, userId: req.user?.id });
        if (!paper) {
            return res.status(404).json({ success: false, error: 'Paper not generated yet' });
        }
        res.json({ success: true, data: paper, cached: false });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=assignmentController.js.map