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

  return `You are an expert educational assessment creator for Indian schools. Generate a comprehensive exam paper in valid JSON format.

IMPORTANT FALLBACK INSTRUCTION:
If a reference syllabus document is attached, attempt to use it as the primary source of context. 
HOWEVER, if the document is empty, unreadable, irrelevant, or fails to parse, YOU MUST IGNORING IT and generate the paper FROM SCRATCH using your extensive knowledge of the specified subject, class, and chapters. Do not return an error or refuse to generate.

Details:
Title: ${input.title}
School/Institution: ${input.schoolName || 'VedaAI School'}
Class: ${input.class}
Subject: ${input.subject}
Chapters/Topics: ${input.chapters.join(', ') || 'General'}
Total Marks: ${totalMarks}
Due Date: ${input.dueDate || 'Not specified'}

Question Distribution:
${input.questionTypes.map(qt => `- ${qt.type}: ${qt.count} questions (${qt.marks} marks each)`).join('\n')}

Instructions:
${input.additionalInstructions || 'None'}

Syllabus Content (may be corrupted or unreadable):
See attached document if provided.

Generate a complete exam paper with EXACTLY the number and type of questions specified. Each question must:
1. Be clearly related to ${input.subject} and the specified chapters
2. Have appropriate difficulty (distribute roughly 40% easy, 40% medium, 20% hard)
3. For MCQ: include exactly 4 options array with format ["A. option1", "B. option2", "C. option3", "D. option4"]
4. Be educationally sound and age-appropriate for ${input.class}
5. difficulty must be exactly one of: "easy", "medium", "hard" (lowercase)

Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:
{
  "title": "${input.title}",
  "schoolName": "${input.schoolName || 'VedaAI School'}",
  "subject": "${input.subject}",
  "class": "${input.class}",
  "totalMarks": ${totalMarks},
  "duration": "suggested duration in minutes",
  "mcqs": [
    {
      "question": "question text",
      "type": "MCQ",
      "difficulty": "easy|medium|hard",
      "marks": number,
      "options": ["A. option1", "B. option2", "C. option3", "D. option4"]
    }
  ],
  "shortQuestions": [
    {
      "question": "question text",
      "type": "ShortAnswer",
      "difficulty": "easy|medium|hard",
      "marks": number
    }
  ],
  "longQuestions": [
    {
      "question": "question text",
      "type": "Descriptive",
      "difficulty": "easy|medium|hard",
      "marks": number
    }
  ],
  "answerKey": ["1. correct answer", "2. model answer", "3. detailed explanation"]
}

Ensure the answerKey array contains the answers for ALL questions in the paper, in the exact order they appear.`;
}

export async function generateExamPaper(input: GenerationInput): Promise<GeneratedPaperData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
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
