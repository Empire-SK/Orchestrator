
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

// Always create a new instance with the current API key to ensure it uses the most up-to-date key from the dialog.
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Analyzes clinical observations using Gemini 3 Pro for advanced reasoning and extraction.
 */
export const analyzeObservation = async (input: string): Promise<AIResponse> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `You are an expert Assistive Technology Researcher and Universal Design Specialist. 
    Analyze the following observation video notes/description regarding a person with a disability. 
    Extract structured "Need Statements" and build a professional evaluation table.
    
    Focus on:
    - Functional barriers in the environment or task.
    - Impact on independence and safety.
    - Opportunities for assistive device intervention.
    
    Observation Input: ${input}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insights: {
            type: Type.OBJECT,
            properties: {
              observation: { type: Type.STRING, description: "Detailed description of the observed behavior" },
              context: { type: Type.STRING, description: "The physical and medical context of the observation" },
              keyInsights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific pain points discovered" },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Proposed assistive interventions" }
            },
            required: ["observation", "context", "keyInsights", "recommendations"]
          },
          tableData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                statement: { type: Type.STRING, description: "The identified user need" },
                category: { type: Type.STRING, description: "Physical, Cognitive, Sensory, or Social barrier" },
                impactScore: { type: Type.NUMBER, description: "1-10 severity of the barrier" },
                marketPotential: { type: Type.STRING, description: "Commercial viability of a solution" },
                riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                feasibility: { type: Type.NUMBER, description: "Technical/Clinical feasibility of solution" },
                innovationScore: { type: Type.NUMBER, description: "Uniqueness of the proposed intervention" },
                unfairAdvantage: { type: Type.STRING, description: "Moat for this solution" },
                timeToExecution: { type: Type.STRING, description: "Estimated R&D timeline" }
              },
              required: ["statement", "category", "impactScore", "marketPotential", "riskLevel", "feasibility", "innovationScore", "unfairAdvantage", "timeToExecution"]
            }
          }
        },
        required: ["insights", "tableData"]
      }
    }
  });

  return JSON.parse(response.text || '{"insights":{},"tableData":[]}');
};

/**
 * Generates a concept visualization video for the proposed assistive technology using Veo models.
 */
export const generateVisionVideo = async (prompt: string): Promise<string> => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Professional cinematic product concept visualization: ${prompt}. Highlighting accessible design, empathetic lighting, 4k, clean aesthetics.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
     if (response.status === 404) {
       throw new Error("Requested entity was not found.");
     }
     throw new Error("Failed to download generated video.");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
