import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeText, analyzeVideo } from "./services/geminiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

import fs from "fs";

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Routes
app.post("/api/analyze", async (req, res) => {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: "Input is required" });

    try {
        const data = await analyzeText(input);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/analyze-video", upload.single("video"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No video file uploaded" });

    try {
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const text = req.body.text;
        const data = await analyzeVideo(filePath, mimeType, text);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../dist/index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Orchestrator server running on port ${PORT}`);
});
