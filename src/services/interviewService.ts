import { GoogleGenAI } from "@google/genai";
import { InterviewFeedback, InterviewMessage } from "../types";

export async function analyzeInterview(transcript: InterviewMessage[]): Promise<InterviewFeedback> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompt = `As "EliteInterviewer AI," you have just finished a BTech placement mock interview. 
  Analyze the following transcript and provide a detailed performance report.
  
  Transcript:
  ${transcript.map(t => `${t.role.toUpperCase()}: ${t.chunk}`).join('\n')}
  
  Return the analysis in JSON format matching this structure:
  {
    "overallScore": number (0-100),
    "technicalAccuracy": number (0-100),
    "clarity": number (0-100),
    "conciseness": number (0-100),
    "communicationSkills": {
      "pace": number (0-100),
      "jargonUsage": number (0-100),
      "fillerWordCount": number,
      "effectiveness": number (0-100)
    },
    "pros": string[],
    "cons": string[],
    "actionableTips": string[],
    "summary": string
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Analysis failed:", error);
    // Return empty fallback
    return {
      overallScore: 0,
      technicalAccuracy: 0,
      clarity: 0,
      conciseness: 0,
      communicationSkills: {
        pace: 0,
        jargonUsage: 0,
        fillerWordCount: 0,
        effectiveness: 0
      },
      pros: [],
      cons: [],
      actionableTips: [],
      summary: "Analysis failed. Please try again."
    };
  }
}
