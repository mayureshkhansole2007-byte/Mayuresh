import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import mammoth from "mammoth";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

const app = express();
const PORT = 3000;

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Gemini AI setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());

// API Endpoint for Resume Analysis
app.post("/api/analyze", upload.array("resumes"), async (req: any, res) => {
  try {
    const jobRequirements = req.body.jobRequirements;
    const files = req.files as any[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No resumes uploaded" });
    }

    if (!jobRequirements) {
      return res.status(400).json({ error: "Job requirements are required" });
    }

    // Parse all resumes
    const parsedResumes = await Promise.all(
      files.map(async (file) => {
        let text = "";
        if (file.mimetype === "application/pdf") {
          const data = await pdf(file.buffer);
          text = data.text;
        } else if (
          file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          text = result.value;
        } else {
          text = file.buffer.toString("utf-8");
        }
        return {
          name: file.originalname,
          content: text.substring(0, 10000), // Limit content size for Gemini
        };
      })
    );

    // Call Gemini to analyze and rank
    const prompt = `
      You are an expert HR recruiter. Analyze the following resumes against the job requirements.
      
      Job Requirements:
      ${jobRequirements}
      
      Resumes:
      ${parsedResumes.map((r, i) => `--- Resume ${i + 1} (${r.name}) ---\n${r.content}`).join("\n\n")}
      
      Task:
      1. Rank the resumes based on relevance to the job requirements.
      2. Provide the TOP 5 (or fewer if less than 5 uploaded) candidates.
      3. For each candidate, provide:
         - Name (from the resume or filename)
         - Match Percentage (0-100)
         - Matched Skills (list)
         - Missing Skills (list)
         - A brief summary of why they are a good match.
         - Highlighted keywords that matched.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  matchPercentage: { type: Type.NUMBER },
                  matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  summary: { type: Type.STRING },
                  highlightedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["name", "matchPercentage", "matchedSkills", "missingSkills", "summary", "highlightedKeywords"],
              },
            },
          },
          required: ["candidates"],
        },
      },
    });

    const result = JSON.parse(response.text || '{"candidates": []}');
    res.json(result);
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze resumes" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
