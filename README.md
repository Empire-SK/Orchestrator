<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Orchestrator: Clinical Observation & Need Synthesis Framework

Orchestrator is a full-stack AI application powered by **Gemini 2.5 Flash** that analyzes clinical observations (text or video) to extract accessibility barriers, identify stakeholders, map pain points to core needs, brainstorm solutions, and generate Need Statements.

View the original prototype in AI Studio: [Orchestrator](https://ai.studio/apps/drive/1yEcN8pjOH5ZQchOK4Nv9A_PbtNmxo_Pn)

## Features
- **Video & Text Analysis**: Upload `.mp4` videos or type clinical observations to generate structured evaluation tables.
- **Robust Backend**: Node.js/Express backend handles video processing via the Gemini Files API securely.
- **API Key Rotation**: The backend automatically rotates through a bank of API keys if quote limits are reached.
- **CSV Export**: Export AI-generated evaluation tables directly to CSV files.

## Run Locally

**Prerequisites:** Node.js v18+

### 1. Install Dependencies
Install dependencies for both the frontend and the backend.
```bash
npm install
cd server && npm install
cd ..
```

### 2. Configure Environment Variables
Create an environment file for the backend to store your Gemini API keys securely.

1. Navigate to the `server/` directory and create a `.env` file.
2. Add your Gemini API keys (you can add multiple for automatic rotation):
```env
GEMINI_API_KEY_1=your_first_api_key_here
GEMINI_API_KEY_2=your_second_api_key_here
PORT=3001
```

### 3. Run the App
Start both the Vite frontend and the Express backend concurrently:
```bash
npm run dev:all
```
The application will be available at `http://localhost:5173`.
