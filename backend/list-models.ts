import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No API key');
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log("AVAILABLE MODELS:");
    if (data.models) {
      data.models.forEach((m: any) => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
