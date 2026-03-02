import { AIResponse } from "../types";

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
};

/**
 * Analyzes clinical observations using the backend API.
 */
export const analyzeObservation = async (input: string): Promise<AIResponse> => {
  console.log(`[Service v6] Starting Text Analysis via Backend...`);
  
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error in analyzeObservation:`, error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
};

/**
 * Analyzes video files using the backend API.
 */
export const analyzeVideoFile = async (file: File): Promise<AIResponse> => {
  console.log(`[Service v6] Starting Video Analysis via Backend...`);
  
  try {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${getApiBaseUrl()}/api/analyze-video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error in analyzeVideoFile:`, error);
    throw new Error(`Video analysis failed: ${error.message}`);
  }
};

export const generateVisionVideo = async (prompt: string): Promise<string> => {
  console.log("[Service v6] Video Generation requested. Using dummy demo data.");
  return new Promise((resolve) => {
    setTimeout(() => {
       // Return a dummy placeholder video
       resolve("https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    }, 4000); // Simulate 4 seconds of "generation" time
  });
};
