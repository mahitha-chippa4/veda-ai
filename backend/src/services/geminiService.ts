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
  "sections": [
    {
      "title": "Section Name (e.g., Short Answer Questions)",
      "instruction": "instruction for this section (e.g., Attempt all questions. Each question carries X marks)",
      "questions": [
        {
          "question": "question text",
          "type": "MCQ|Descriptive|TrueFalse|FillBlanks|ShortAnswer",
          "difficulty": "easy|medium|hard",
          "marks": number,
          "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
          "answer": "correct answer or model answer"
        }
      ]
    }
  ]
}

Group questions by type into separate sections labeled as Section A, Section B, etc. Each section should have a clear title and instruction.`;
}

export async function generateExamPaper(input: GenerationInput): Promise<GeneratedPaperData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
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
  validated.sections = validated.sections.map((section, si) => ({
    ...section,
    questions: section.questions.map((q, qi) => ({
      ...q,
      id: `q-${si + 1}-${qi + 1}`,
    })),
  }));

  return validated;
}
