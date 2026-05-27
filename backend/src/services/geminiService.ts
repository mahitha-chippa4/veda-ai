import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { config } from '../config';
import { GeneratedPaperData, GeneratedPaperSchema, QuestionTypeInput } from '../types';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

interface GenerationInput {
  title: string;
  subject: string;
  class: string;
  schoolName?: string;
  chapters: string[];
  questionTypes: QuestionTypeInput[];
  dueDate?: string;
  additionalInstructions?: string;
  syllabusFile?: string;
}

function buildPrompt(input: GenerationInput): string {
  const totalMarks = input.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);
  const questionSummary = input.questionTypes

  return `Generate a JSON exam paper for Indian schools.
Title: ${input.title}
Subject: ${input.subject} (${input.class})
Chapters: ${input.chapters.join(', ')}
Total Marks: ${totalMarks}
Question Breakdown: ${input.questionTypes.map(qt => `${qt.type}: ${qt.count} q (${qt.marks}m/each)`).join(', ')}
Extra Instructions: ${input.additionalInstructions || 'None'}

Use the attached syllabus if relevant. If unreadable, generate from scratch. Ensure 40% easy, 40% medium, 20% hard.

Return ONLY JSON matching exactly:
{
  "title": "${input.title}",
  "schoolName": "${input.schoolName || 'VedaAI'}",
  "subject": "${input.subject}",
  "class": "${input.class}",
  "totalMarks": ${totalMarks},
  "duration": "e.g. 120 mins",
  "mcqs": [{ "question": "...", "type": "MCQ", "difficulty": "easy|medium|hard", "marks": 0, "options": ["A.", "B.", "C.", "D."] }],
  "shortQuestions": [{ "question": "...", "type": "ShortAnswer", "difficulty": "easy|medium|hard", "marks": 0 }],
  "longQuestions": [{ "question": "...", "type": "Descriptive", "difficulty": "easy|medium|hard", "marks": 0 }],
  "answerKey": ["1. answer", "2. answer"]
}`;
}

export async function generateExamPaper(input: GenerationInput): Promise<GeneratedPaperData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  const prompt = buildPrompt(input);
  const reqParts: any[] = [{ text: prompt }];

  if (input.syllabusFile && fs.existsSync(input.syllabusFile)) {
    try {
      const ext = input.syllabusFile.split('.').pop()?.toLowerCase();
      let mimeType = 'application/pdf';
      if (ext === 'txt') mimeType = 'text/plain';
      else if (ext === 'doc' || ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      const fileData = fs.readFileSync(input.syllabusFile);
      reqParts.push({
        inlineData: {
          data: fileData.toString('base64'),
          mimeType,
        },
      });
    } catch (e) {
      console.error('Failed to attach syllabus file:', e);
    }
  }

  console.log("Gemini API called");
  const result = await model.generateContent(reqParts);
  const text = result.response.text();

  // Parse and clean the JSON
  let jsonText = text.trim();
  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  jsonText = jsonText.replace(/^```\s*/i, '').replace(/\s*```$/i, '');

  const parsed = JSON.parse(jsonText);

  // Validate against our Zod schema
  const validated = GeneratedPaperSchema.parse(parsed);

  // Add IDs to questions
  validated.mcqs = validated.mcqs.map((q, i) => ({ ...q, id: `mcq-${i + 1}` }));
  validated.shortQuestions = validated.shortQuestions.map((q, i) => ({ ...q, id: `short-${i + 1}` }));
  validated.longQuestions = validated.longQuestions.map((q, i) => ({ ...q, id: `long-${i + 1}` }));

  return validated;
}
