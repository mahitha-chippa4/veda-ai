"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const client_1 = require("./redis/client");
const server_1 = require("./websocket/server");
const questionGenerationWorker_1 = require("./workers/questionGenerationWorker");
const assignments_1 = __importDefault(require("./routes/assignments"));
const groups_1 = __importDefault(require("./routes/groups"));
const toolkit_1 = __importDefault(require("./routes/toolkit"));
const auth_1 = __importDefault(require("./routes/auth"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Ensure upload directories exist
const uploadsDir = path_1.default.resolve(config_1.config.uploadDir);
['syllabus', 'pdfs'].forEach(dir => {
    const fullPath = path_1.default.join(uploadsDir, dir);
    if (!fs_1.default.existsSync(fullPath))
        fs_1.default.mkdirSync(fullPath, { recursive: true });
});
// Middleware
app.use((0, cors_1.default)({
    origin: [config_1.config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static file serving for uploads
app.use('/uploads', express_1.default.static(path_1.default.resolve(config_1.config.uploadDir)));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            mongodb: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
        },
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/assignments', assignments_1.default);
app.use('/api/groups', groups_1.default);
app.use('/api/toolkit', toolkit_1.default);
// 404 + Error handlers
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
async function bootstrap() {
    try {
        // Connect MongoDB
        await mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('✅ MongoDB connected');
        // Connect Redis
        await (0, client_1.connectRedis)();
        // Init WebSocket server
        (0, server_1.initWebSocketServer)(server);
        console.log('✅ WebSocket server initialized');
        // Start workers
        (0, questionGenerationWorker_1.startQuestionGenerationWorker)();
        // Start HTTP server
        server.listen(config_1.config.port, () => {
            console.log(`🚀 VedaAI Backend running on port ${config_1.config.port}`);
            console.log(`📡 WebSocket available at ws://localhost:${config_1.config.port}/ws`);
            console.log(`🌐 Health check: http://localhost:${config_1.config.port}/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        mongoose_1.default.disconnect();
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map