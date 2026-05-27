import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { config } from './config';
import { connectRedis } from './redis/client';
import { initWebSocketServer } from './websocket/server';
import { startQuestionGenerationWorker } from './workers/questionGenerationWorker';
import assignmentRoutes from './routes/assignments';
import groupRoutes from './routes/groups';
import toolkitRoutes from './routes/toolkit';
import authRoutes from './routes/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const server = http.createServer(app);

// Ensure upload directories exist
const uploadsDir = path.resolve(config.uploadDir);
['syllabus', 'pdfs'].forEach(dir => {
  const fullPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Middleware
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/toolkit', toolkitRoutes);

// 404 + Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  try {
    // Connect MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected');

    // Connect Redis
    await connectRedis();

    // Init WebSocket server
    initWebSocketServer(server);
    console.log('✅ WebSocket server initialized');

    // Start workers
    startQuestionGenerationWorker();

    // Start HTTP server
    server.listen(config.port, () => {
      console.log(`🚀 VedaAI Backend running on port ${config.port}`);
      console.log(`📡 WebSocket available at ws://localhost:${config.port}/ws`);
      console.log(`🌐 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.disconnect();
    process.exit(0);
  });
});
