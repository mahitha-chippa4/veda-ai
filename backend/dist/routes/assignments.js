"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const assignmentController_1 = require("../controllers/assignmentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Multer setup for syllabus upload
const storage = multer_1.default.diskStorage({
    destination: path_1.default.join(config_1.config.uploadDir, 'syllabus'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.txt', '.doc', '.docx'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext))
            cb(null, true);
        else
            cb(new Error('Only PDF, TXT, DOC files allowed'));
    },
});
// Protect all assignment routes
router.use(auth_1.authMiddleware);
router.get('/', assignmentController_1.getAssignments);
router.post('/', upload.single('syllabusFile'), assignmentController_1.createAssignment);
router.get('/:id', assignmentController_1.getAssignment);
router.delete('/:id', assignmentController_1.deleteAssignment);
router.post('/:id/regenerate', assignmentController_1.regenerateAssignment);
// Paper routes nested under assignments
router.get('/:assignmentId/paper', assignmentController_1.getPaper);
exports.default = router;
//# sourceMappingURL=assignments.js.map