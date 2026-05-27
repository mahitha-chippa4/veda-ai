"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.config = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/veda_ai',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
};
if (!exports.config.geminiApiKey) {
    console.warn('⚠️  GEMINI_API_KEY not set. AI generation will fail.');
}
//# sourceMappingURL=index.js.map