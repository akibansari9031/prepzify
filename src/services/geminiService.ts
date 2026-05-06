import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  try {
    return process.env.GEMINI_API_KEY || "";
  } catch {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const models = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3.1-pro-preview",
};

export async function generateInterviewQuestion(history: { role: string; content: string }[], role: string) {
  try {
    const contents = history.length > 0 
      ? history.map(h => ({
          role: h.role === 'ai' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }))
      : [{ role: 'user', parts: [{ text: `Start a technical interview for a ${role} position.` }] }];

    const response = await ai.models.generateContent({
      model: models.flash,
      contents,
      config: {
        systemInstruction: `You are "EliteInterviewer AI," a senior technical recruiter and placement officer specialized in BTech campus placements. Your goal is to conduct a high-stakes, realistic mock interview for engineering students preparation.

OPERATIONAL GUIDELINES:
1. BE CONVERSATIONAL: Write for the ear. Avoid bullet points, long lists, or complex markdown. Use natural, human-like speech.
2. ONE QUESTION AT A TIME: Never ask multiple questions at once. Wait for the user's response.
3. HANDS-FREE FLOW: End every response with a "bridge phrase" to hand the floor back to the student. Examples: "Tell me about your approach," "What's your take on that?", "I'd love to hear your thoughts on this."
4. ACTIVE LISTENING: Start your response by briefly acknowledging or validating the student's previous answer (e.g., "That's a solid explanation of recursion," or "Interesting project choice.").
5. STEADY PROGRESSION: Follow these stages:
   - Stage 1: Introduction. Ask for the student's name and engineering branch if not known.
   - Stage 2: Technical. Deep dive into CS fundamentals (DSA, Networking, OS) and their specific tech stack.
   - Stage 3: HR & Behavioral. Situational questions, leadership, and goals.
6. PROBING & HINTS: If an answer is too short, ask them to expand. If they are stuck, provide a small, helpful hint to keep the flow.

Return your response in structured JSON format with the following keys:
- feedback: An object containing "strengths" (array of strings) and "improvements" (array of strings) based on the user's PREVIOUS answer. If this is the start, leave these arrays empty.
- nextQuestion: A string containing the next technical challenge or follow-up question.`,
        responseMimeType: "application/json",
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (generateInterview):", error);
    throw error;
  }
}

export async function analyzeCode(code: string, language: string) {
  try {
    const prompt = `Analyze the following ${language} code for performance, readability, and potential bugs. 
    Provide specific optimization tips and a brief complexity analysis (Time/Space).
    Return your response in a structured format.
    
    Code:
    ${code}`;

    const response = await ai.models.generateContent({
      model: models.flash,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior staff engineer providing code reviews.",
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (analyzeCode):", error);
    throw error;
  }
}

export async function analyzeResume(resumeText: string, jobTitle: string = 'General Software Engineer', jobDescription: string = '') {
  try {
    const prompt = `Analyze the following resume in the context of the job title "${jobTitle}" and description: "${jobDescription}".
    
    Provide feedback in JSON format. 
    Include: 
    - score (0-100): overall match score for this specific role.
    - keyStrengths (array of strings): areas where the candidate excels for this role.
    - areasForImprovement (array of strings): skill gaps or weak points relative to the job requirements.
    - atsCompatibility (string): detailed technical feedback on how an ATS would parser this for this role.
    - summary (string): a high-level overview of the fit.
    - recommendations (array of strings): specific additions or changes to maximize impact for this CATEGORY of job.
    
    Resume:
    ${resumeText}`;

    const response = await ai.models.generateContent({
      model: models.flash,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (analyzeResume):", error);
    throw error;
  }
}

export async function extractTextFromImage(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: [{
        role: 'user',
        parts: [
          { text: "Extract all text from this resume image exactly as it appears. Maintain the formatting if possible. Output only the text content." },
          {
            inlineData: {
              data: base64,
              mimeType: file.type
            }
          }
        ]
      }]
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (extractTextFromImage):", error);
    throw error;
  }
}
