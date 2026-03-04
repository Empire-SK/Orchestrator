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
export const analyzeVideoFile = async (file: File, text?: string): Promise<AIResponse> => {
  console.log(`[Service v6] Starting Video Analysis via Backend...`);
  
  try {
    const formData = new FormData();
    formData.append('video', file);
    if (text) {
      formData.append('text', text);
    }

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

/**
 * Refines the current analysis using a chat-style user input.
 */
export const refineObservation = async (previousData: AIResponse, input: string): Promise<AIResponse> => {
  console.log(`[Service] Starting Refinement via Backend...`);
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/refine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ previousData, input }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Error in refineObservation:`, error);
    throw new Error(`Refinement failed: ${error.message}`);
  }
};
