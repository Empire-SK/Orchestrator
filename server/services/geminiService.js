import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Get all API keys from .env
const apiKeys = Object.keys(process.env)
    .filter(key => key.startsWith('GEMINI_API_KEY'))
    .map(key => process.env[key])
    .filter(Boolean);

if (apiKeys.length === 0) {
    console.error("❌ No GEMINI_API_KEY found in server/.env");
}

let currentKeyIndex = 0;

const getAI = () => {
    const apiKey = apiKeys[currentKeyIndex];
    return new GoogleGenAI({ apiKey });
};

const rotateKey = () => {
    if (apiKeys.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        console.log(`[GeminiService] 🔄 Rotating to API Key #${currentKeyIndex + 1}`);
        return true;
    }
    return false;
};

const handleAIError = async (error, context, retryFn, attempts = 0) => {
    // New @google/genai SDK often wraps errors in a complex object
    const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
    console.error(`[GeminiService] Error in ${context}:`, error.message || errorStr);

    if (errorStr.includes("429") || errorStr.toLowerCase().includes("quota")) {
        // Prevent infinite loop by capping at the number of keys
        if (attempts < apiKeys.length && rotateKey()) {
            console.log(`[GeminiService] Retrying ${context} with new key...`);
            return await retryFn(attempts + 1);
        }
        throw new Error("Quota exceeded and no more API keys available. If you see limit: 0, your region or project may restrict this model's free tier.");
    }

    throw error;
};

export const analyzeText = async (input) => {
    const execute = async (attempts = 0) => {
        const ai = getAI();
        const prompt = `You are an expert Assistive Technology Researcher. 
      Analyze the following observation: ${input}.
      Extract specific insights and build an evaluation table following the Orchestrator framework.
      
      Table columns needed:
      1. Barrier: The functional limitation or physical/social obstacle.
      2. Stakeholder: Who is affected.
      3. Pain: The specific emotional or physical frustration.
      4. Workaround: Any current temporary solution used.
      5. Need: The core functional requirement.
      6. Statement: A concise "A person needs X in order to Y" statement.
      
      Also provide:
      - Problem Brainstorm: A list of related problems identified.
      - Questions: Critical questions for further research.
      
      Respond ONLY in valid JSON matching this schema:
      {
        "insights": {
          "observationSummary": "string",
          "context": "string",
          "problemBrainstorm": ["string"],
          "questions": ["string"]
        },
        "tableData": [
          {
            "barrier": "string",
            "stakeholder": "string",
            "pain": "string",
            "workaround": "string",
            "need": "string",
            "statement": "string"
          }
        ]
      }`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        let text = result.text || '';
        text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        return JSON.parse(text || '{"insights":{},"tableData":[]}');
    };

    try {
        return await execute();
    } catch (error) {
        return await handleAIError(error, "analyzeText", execute);
    }
};

export const analyzeVideo = async (filePath, mimeType, textPrompt) => {
    const execute = async (attempts = 0) => {
        const ai = getAI();

        // 1. Upload file to Gemini Files API
        console.log(`[GeminiService] 📤 Uploading video: ${filePath}`);
        // The new SDK uses ai.files.upload method
        const uploadResult = await ai.files.upload({
            file: filePath,
            mimeType,
            displayName: "Observation Video",
        });

        // 2. Wait for file to become ACTIVE
        let file = await ai.files.get({ name: uploadResult.name });
        while (file.state === "PROCESSING") {
            process.stdout.write(".");
            await new Promise((resolve) => setTimeout(resolve, 5000));
            file = await ai.files.get({ name: uploadResult.name });
        }

        if (file.state === "FAILED") {
            throw new Error("Video processing failed in Gemini.");
        }

        console.log(`[GeminiService] ✅ Video active: ${file.uri}`);

        // 3. Generate content from video
        const prompt = `Analyze this video for clinical observations and assistive technology needs.
      ${textPrompt ? `\nAdditional observation notes from the user: "${textPrompt}"\n` : ''}
      Extract specific insights and build an evaluation table following the Orchestrator framework.
      
      Table columns needed:
      1. Barrier: The functional limitation or physical/social obstacle.
      2. Stakeholder: Who is affected.
      3. Pain: The specific emotional or physical frustration.
      4. Workaround: Any current temporary solution used.
      5. Need: The core functional requirement.
      6. Statement: A concise "A person needs X in order to Y" statement.
      
      Also provide:
      - Problem Brainstorm: A list of related problems identified.
      - Questions: Critical questions for further research.
      
      Respond ONLY in valid JSON matching the same schema as used for text.`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    fileData: {
                        mimeType: file.mimeType,
                        fileUri: file.uri
                    }
                },
                prompt
            ],
            config: {
                responseMimeType: "application/json"
            }
        });

        let text = result.text || '';
        text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        return JSON.parse(text || '{"insights":{},"tableData":[]}');
    };

    try {
        const data = await execute();
        // Clean up local temp file after success
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return data;
    } catch (error) {
        // Clean up local temp file on error too
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return await handleAIError(error, "analyzeVideo", execute);
    }
};
