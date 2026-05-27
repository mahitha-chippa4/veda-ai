"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, schoolName } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Email is already registered' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = new User_1.User({ name, email, passwordHash, schoolName: schoolName || '' });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, schoolName: user.schoolName }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'No account found. Please register first.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, schoolName: user.schoolName }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user?.id).select('-passwordHash');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
// PUT /api/auth/me
router.put('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const { name, schoolName, password } = req.body;
        const user = await User_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (name)
            user.name = name;
        if (schoolName !== undefined)
            user.schoolName = schoolName;
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            user.passwordHash = await bcryptjs_1.default.hash(password, salt);
        }
        await user.save();
        res.json({
            user: { id: user._id, name: user.name, email: user.email, schoolName: user.schoolName }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map