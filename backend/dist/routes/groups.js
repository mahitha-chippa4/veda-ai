"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Group_1 = require("../models/Group");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// GET all groups
router.get('/', async (req, res) => {
    try {
        const groups = await Group_1.Group.find({ userId: req.user?.id }).sort({ createdAt: -1 });
        res.json(groups);
    }
    catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});
// POST new group
router.post('/', async (req, res) => {
    try {
        const { name, class: className, subject, description, studentCount } = req.body;
        if (!name || !className || !subject) {
            return res.status(400).json({ error: 'Name, class, and subject are required' });
        }
        const group = new Group_1.Group({
            name,
            class: className,
            subject,
            description,
            studentCount: studentCount || 0,
            userId: req.user?.id,
        });
        await group.save();
        res.status(201).json(group);
    }
    catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
});
// DELETE a group
router.delete('/:id', async (req, res) => {
    try {
        const group = await Group_1.Group.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json({ message: 'Group deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
});
exports.default = router;
//# sourceMappingURL=groups.js.map