import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { config } from '../config';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
  regenerateAssignment,
  getPaper,
} from '../controllers/assignmentController';

import { authMiddleware } from '../middleware/auth';

const router = Router();

// Multer setup for syllabus upload
const storage = multer.diskStorage({
  destination: path.join(config.uploadDir, 'syllabus'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, TXT, DOC files allowed'));
  },
});

// Protect all assignment routes
router.use(authMiddleware);

router.get('/', getAssignments);
router.post('/', upload.single('syllabusFile'), createAssignment);
router.get('/:id', getAssignment);
router.delete('/:id', deleteAssignment);
router.post('/:id/regenerate', regenerateAssignment);

// Paper routes nested under assignments
router.get('/:assignmentId/paper', getPaper);

export default router;
