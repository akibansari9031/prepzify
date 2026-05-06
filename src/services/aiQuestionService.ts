import { GoogleGenAI } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateAIQuestions(
  deptName: string,
  topic: string,
  category: 'coding' | 'aptitude' | 'technical',
  branch: string
): Promise<Question[]> {
  let prompt = '';

  if (category === 'coding') {
    prompt = `Generate exactly 10 coding problems for ${deptName} students on "${topic}". Mix easy (4), medium (4), hard (2).
Return ONLY a valid JSON array, no markdown code blocks:
[{"title":"...","content":"Full problem description","difficulty":"easy|medium|hard","examples":[{"input":"...","output":"..."}],"constraints":["..."],"starterCode":"// starter code"}]`;
  } else if (category === 'aptitude') {
    prompt = `Generate exactly 10 aptitude MCQ questions for ${deptName} students on "${topic}". Mix easy (4), medium (4), hard (2).
Return ONLY a valid JSON array, no markdown code blocks:
[{"title":"...","content":"Full question","difficulty":"easy|medium|hard","options":["A","B","C","D"],"correctIndex":0,"explanation":"Explanation of the solution"}]`;
  } else {
    prompt = `Generate exactly 10 technical MCQ questions for ${deptName} students on "${topic}". Mix easy (4), medium (4), hard (2).
Return ONLY a valid JSON array, no markdown code blocks:
[{"title":"...","content":"Full technical question","difficulty":"easy|medium|hard","options":["A","B","C","D"],"correctIndex":0,"explanation":"Detailed explanation"}]`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text || '[]';
    
    // Clean potential markdown wrap
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(cleanJson);

    return questions.map((q: any, index: number) => ({
      ...q,
      id: `ai-${branch}-${topic}-${category}-${index}-${Date.now()}`,
      solved: false,
      branch: branch,
      topic: topic,
      category: category
    }));
  } catch (error) {
    console.error("Failed to generate questions:", error);
    return [];
  }
}
