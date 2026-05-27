"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfQueue = exports.questionQueue = void 0;
const bullmq_1 = require("bullmq");
const config_1 = require("../config");
const connection = { url: config_1.config.redisUrl };
exports.questionQueue = new bullmq_1.Queue('question-generation', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
exports.pdfQueue = new bullmq_1.Queue('pdf-generation', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 25 },
    },
});
//# sourceMappingURL=index.js.map