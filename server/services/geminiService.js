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
        const prompt = `You are a strict gatekeeper and expert Assistive Technology Researcher. Your ONLY job is to analyze clinical observations about people with disabilities or health conditions and generate an evaluation table.

The user has submitted this observation:
"${input}"

STEP 1 — RELEVANCE CHECK (strict):
Determine if this observation is DIRECTLY about a person experiencing a disability, health condition, physical/cognitive/sensory impairment, or an assistive technology / accessibility need.

Mark as RELEVANT only if the observation describes:
- A person with a physical, cognitive, sensory, or mental health condition
- A real-world functional limitation or barrier faced by such a person
- An accessibility challenge or assistive technology need
- A caregiver or clinician observing such a person

Mark as OFF-TOPIC if:
- It is a request to write code, build software, or create any app or website
- It describes a non-disability engineering or design problem
- It is a general question, greeting, or unrelated topic
- It contains no observable human subject with a disability or health need

STEP 2 — RESPOND:
If OFF-TOPIC, respond ONLY with:
{ "offTopic": true, "message": "This tool only analyzes clinical observations about people with disabilities or accessibility needs. Please describe a real observation of a person experiencing a functional barrier." }

If RELEVANT, extract specific insights and build an evaluation table following the Orchestrator framework. Respond ONLY with:
{
  "offTopic": false,
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
        return JSON.parse(text || '{"offTopic":true,"message":"Unable to process the request."}');
    };

    try {
        return await execute();
    } catch (error) {
        return await handleAIError(error, "analyzeText", execute);
    }
};

export const refineAnalysis = async (previousData, userInput) => {
    const execute = async (attempts = 0) => {
        const ai = getAI();
        const prompt = `You are a strict gatekeeper and expert Assistive Technology Researcher. Your ONLY job is to refine a clinical observation evaluation table.

The current evaluation table and insights are:
${JSON.stringify(previousData)}

The user sent this message:
"${userInput}"

Your task has TWO steps:

STEP 1 — RELEVANCE CHECK (strict):
Decide if the message is DIRECTLY about the clinical observation above. Only mark it as relevant if it is clearly about:
- The specific patient, caregiver, or environment in this observation
- Modifying, correcting, or expanding the table rows (barriers, stakeholders, pain, workaround, need, statement)
- Adding context about assistive technology needs for this case
- Asking follow-up questions about this specific observation

Mark it as OFF-TOPIC if it is about ANY of the following (even partially):
- Coding, software development, web/app creation (e.g. "create a todo app", "write code", "build a website")
- General knowledge, science, history, math, entertainment
- Other medical cases not present in the table
- Greetings, jokes, or unrelated conversation
- Anything that is not about refining THIS specific evaluation table

STEP 2 — RESPOND:
If OFF-TOPIC, respond ONLY with:
{ "offTopic": true, "message": "Your message is outside the scope of this clinical observation. I can only help refine or expand the current evaluation table." }

If RELEVANT, respond ONLY with:
{
  "offTopic": false,
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
        return JSON.parse(text || '{"offTopic":true,"message":"Unable to process the request."}');
    };

    try {
        return await execute();
    } catch (error) {
        return await handleAIError(error, "refineAnalysis", execute);
    }
};

export const analyzeVideo = async (filePath, mimeType, textPrompt) => {
    const execute = async (attempts = 0) => {
        const ai = getAI();

        // 1. Read file into a Buffer and wrap as a Blob (avoids Windows path stat issues)
        console.log(`[GeminiService] 📤 Reading video file: ${filePath}`);
        const fileBuffer = fs.readFileSync(filePath);
        const fileBlob = new Blob([fileBuffer], { type: mimeType });

        console.log(`[GeminiService] 📤 Uploading video blob to Gemini Files API...`);
        const uploadResult = await ai.files.upload({
            file: fileBlob,
            config: {
                mimeType,
                displayName: "Observation Video",
            },
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

        // 3. Generate content from video with topic guard
        const prompt = `You are a strict gatekeeper and expert Assistive Technology Researcher. Your ONLY job is to analyze clinical observations about people with disabilities or health conditions.

Analyze this video.${textPrompt ? `\nAdditional notes from the user: "${textPrompt}"` : ''}

STEP 1 — RELEVANCE CHECK (strict):
Does this video show a person experiencing a disability, health condition, physical/cognitive/sensory impairment, or an assistive technology / accessibility need?

Mark as OFF-TOPIC if:
- The video contains no observable human disability or health need
- It is software, animation, or unrelated content

STEP 2 — RESPOND:
If OFF-TOPIC, respond ONLY with:
{ "offTopic": true, "message": "This tool only analyzes clinical observations about people with disabilities or accessibility needs." }

If RELEVANT, extract insights and build the Orchestrator evaluation table. Respond ONLY with:
{
  "offTopic": false,
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

        console.log("[GeminiService] Raw AI Result:", JSON.stringify(result));

        let text = result.text || '';
        if (!text) {
            console.error("[GeminiService] WARNING: AI returned empty text!");
        }
        text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        return JSON.parse(text || '{"offTopic":true,"message":"Unable to process the video."}');
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
