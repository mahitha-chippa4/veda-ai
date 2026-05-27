"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setJobProgress = setJobProgress;
exports.getJobProgress = getJobProgress;
exports.setCachedPaper = setCachedPaper;
exports.getCachedPaper = getCachedPaper;
exports.invalidatePaperCache = invalidatePaperCache;
const client_1 = require("./client");
const PAPER_CACHE_TTL = 86400; // 24 hours
const JOB_PROGRESS_TTL = 3600; // 1 hour
async function setJobProgress(assignmentId, progress) {
    const client = (0, client_1.getRedisClient)();
    await client.setex(`job:progress:${assignmentId}`, JOB_PROGRESS_TTL, JSON.stringify(progress));
}
async function getJobProgress(assignmentId) {
    const client = (0, client_1.getRedisClient)();
    const data = await client.get(`job:progress:${assignmentId}`);
    return data ? JSON.parse(data) : null;
}
async function setCachedPaper(assignmentId, paper) {
    const client = (0, client_1.getRedisClient)();
    await client.setex(`paper:${assignmentId}`, PAPER_CACHE_TTL, JSON.stringify(paper));
}
async function getCachedPaper(assignmentId) {
    const client = (0, client_1.getRedisClient)();
    const data = await client.get(`paper:${assignmentId}`);
    return data ? JSON.parse(data) : null;
}
async function invalidatePaperCache(assignmentId) {
    const client = (0, client_1.getRedisClient)();
    await client.del(`paper:${assignmentId}`);
    await client.del(`job:progress:${assignmentId}`);
}
//# sourceMappingURL=cache.js.map