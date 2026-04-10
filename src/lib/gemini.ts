import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CareerSuggestion {
  title: string;
  description: string;
  matchReason: string;
  educationRequired: string[];
  potentialJobGrowth: string;
  skillsNeeded: string[];
  averageSalary: string;
}

export async function getCareerSuggestions(profile: {
  interests: string;
  skills: string;
  academicRecord: string;
}): Promise<CareerSuggestion[]> {
  const prompt = `
    Analyze the following student profile and suggest 3-5 potential career paths.
    
    Student Profile:
    - Interests: ${profile.interests}
    - Skills: ${profile.skills}
    - Academic Record: ${profile.academicRecord}
    
    For each career path, provide:
    1. Title
    2. A brief description
    3. Why it matches the student's profile (matchReason)
    4. Required education/certifications
    5. Potential job growth (e.g., "10% growth over next decade", "High demand")
    6. Key skills needed for this career
    7. Estimated average annual salary range
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            matchReason: { type: Type.STRING },
            educationRequired: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            potentialJobGrowth: { type: Type.STRING },
            skillsNeeded: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            averageSalary: { type: Type.STRING }
          },
          required: ["title", "description", "matchReason", "educationRequired", "potentialJobGrowth", "skillsNeeded", "averageSalary"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return [];
  }
}
