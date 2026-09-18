import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy GoogleGenAI client helper
function getGeminiClient(providedApiKey?: string): GoogleGenAI {
  const key = providedApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No Gemini API key provided. Please input your Gemini API key in the admin panel or configure GEMINI_API_KEY.');
  }
  return new GoogleGenAI({ apiKey: key });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasServerKey: Boolean(process.env.GEMINI_API_KEY), time: new Date().toISOString() });
});

/**
 * AI Auto-Course Generation Endpoint:
 * Generates a full structured course draft using Gemini 3.8 / 3.6 Flash
 * This draft is returned to the client and NEVER auto-posted without explicit user permission/review.
 */
app.post('/api/ai/generate-course', async (req, res) => {
  try {
    const { topic, courseType = 'HTML', targetLevel = 'Beginner', additionalNotes = '', apiKey = '', model = 'gemini-3.8-flash' } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Course topic is required.' });
    }

    const ai = getGeminiClient(apiKey);
    const selectedModel = model || 'gemini-3.8-flash';

    const systemPrompt = `You are an expert curriculum developer and coding educator for "Learn2Code", a community coding education platform designed for students learning via WhatsApp sessions and a web-based Code Lab.

You will generate a complete course syllabus and curriculum bundle for the given topic.
Respond ONLY with valid, raw JSON with NO markdown code fences, matching this exact schema:

{
  "title": "Clear concise course title",
  "description": "2-3 sentences overview describing what students will build and understand",
  "course_type": "HTML" | "CSS" | "JS" | "Fullstack",
  "level": "Beginner" | "Intermediate" | "Advanced",
  "image_url": "A relevant high quality Unsplash tech image URL",
  "media_type": "picture",
  "code_example_title": "Title of the starter code snippet",
  "code_example_explanation": "Explanation of how the code works and what to modify",
  "code_example": "A complete, working HTML/CSS/JS starter snippet students can experiment with in the Code Lab",
  "lesson_recall": {
    "title": "Lesson title for recall",
    "whatsapp_session_title": "Title for WhatsApp evening lecture session",
    "whatsapp_date": "Today, 8:00 PM",
    "body": "Detailed lecture notes covering concepts, syntax breakdown, common errors, and best practices (formatted in clear markdown)",
    "key_takeaways": [
      "Key takeaway 1",
      "Key takeaway 2",
      "Key takeaway 3"
    ]
  },
  "task": {
    "title": "Practical task title",
    "instructions": "Clear step-by-step instructions for what students must code and submit in the Code Lab",
    "points": 50,
    "requirements": [
      {
        "id": "req_1",
        "description": "Requirement 1 describing a tag or selector (e.g. Include an <h1> heading tag)",
        "target": "h1",
        "expected": "present"
      },
      {
        "id": "req_2",
        "description": "Requirement 2 describing styling or script logic",
        "target": "p",
        "expected": "present"
      }
    ]
  },
  "quiz": {
    "question": "A multiple-choice question testing the core lesson concept",
    "options": [
      { "id": "A", "text": "Option A text" },
      { "id": "B", "text": "Option B text" },
      { "id": "C", "text": "Option C text" },
      { "id": "D", "text": "Option D text" }
    ],
    "correct_option": "A",
    "explanation": "Clear explanation of why this answer is correct"
  }
}`;

    const userPrompt = `Topic: "${topic.trim()}"
Language/Domain: ${courseType}
Target Level: ${targetLevel}
Additional Instructor Notes: ${additionalNotes || 'Standard community curriculum'}`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseErr) {
      // Clean up markdown fences if any slipped in
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      model: selectedModel,
      draft: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini Course Generation Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate course with Gemini AI.',
    });
  }
});

// Vite middleware / static files setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Learn2Code Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
