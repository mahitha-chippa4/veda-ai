"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.geminiApiKey);
router.use(auth_1.authMiddleware);
router.post('/generate', async (req, res) => {
    try {
        const { toolType, topic, class: className, additionalContext } = req.body;
        if (!toolType || !topic) {
            return res.status(400).json({ error: 'Tool type and topic are required' });
        }
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
            },
        });
        let prompt = '';
        if (toolType === 'lesson_plan') {
            prompt = `You are an expert teacher and curriculum designer. Create a comprehensive, engaging lesson plan for the following topic.

Topic: ${topic}
${className ? `Class/Grade Level: ${className}` : ''}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Please format the response in clean Markdown with the following sections:
1. Lesson Objectives
2. Materials Needed
3. Introduction / Hook (5-10 mins)
4. Main Instruction / Activity (20-30 mins)
5. Guided Practice (10-15 mins)
6. Independent Practice / Assessment (10 mins)
7. Closure (5 mins)
8. Homework / Extension`;
        }
        else if (toolType === 'rubric') {
            prompt = `You are an expert teacher. Create a detailed grading rubric for an assignment about the following topic.

Topic: ${topic}
${className ? `Class/Grade Level: ${className}` : ''}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Please format the response in clean Markdown, preferably using a Markdown table. The rubric should include:
1. Assignment Description
2. Grading Criteria (e.g., Content, Organization, Creativity, Grammar/Mechanics)
3. Performance Levels (e.g., Excellent, Good, Fair, Needs Improvement) with specific descriptions for each cell.`;
        }
        else {
            return res.status(400).json({ error: 'Invalid tool type' });
        }
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.json({ result: text });
    }
    catch (error) {
        console.error('Error generating toolkit content:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});
exports.default = router;
//# sourceMappingURL=toolkit.js.map