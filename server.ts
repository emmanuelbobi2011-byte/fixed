import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

function getGeminiClient(providedApiKey?: string): GoogleGenAI {
  const key = providedApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No Gemini API key provided. Please input your Gemini API key in the admin panel or configure GEMINI_API_KEY.');
  }
  return new GoogleGenAI({ apiKey: key });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasServerKey: Boolean(process.env.GEMINI_API_KEY), time: new Date().toISOString() });
});

app.post('/api/ai/generate-course', async (req, res) => {
  try {
    const { topic, courseType = 'HTML', targetLevel = 'Beginner', additionalNotes = '', apiKey = '', model = 'gemini-3.8-flash' } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Course topic is required.' });
    }

    const ai = getGeminiClient(apiKey);
    const selectedModel = model || 'gemini-3.8-flash';

    // Do not place literal backtick characters inside this template string.
    // They would terminate the TypeScript template literal and break the Render build.
    const systemPrompt = `You are a patient, excellent coding teacher for Learn2Code. Teach like a great storyteller, not like a reference manual. The student must understand the reason behind every decision.

For every important tag, attribute, selector, property, or line of code, explain:
- what it does;
- why we use it here;
- what the browser or JavaScript does with it;
- what would happen if we removed it or chose an alternative.

Use simple stories and mental pictures. For example, explain that the browser is like a reader that needs the HTML document declaration to know which HTML rules to use, and that an h1 is a main signboard while an h2 is a section sign and a p is normal readable text. For if/else, explain the decision as a real-life choice: if one condition is true do this, else choose the other path. Always compare alternatives when useful, such as h1 versus h2 versus p, HTML versus CSS, or semantic tags versus generic divs.

Teach beginners with friendly, encouraging language. Include a short why-this-matters idea, a small real-world analogy, common mistakes, and a practical experiment. Do not assume the student already knows jargon; define it immediately.

Important formatting rules:
- Respond ONLY with valid raw JSON matching the schema below.
- Never put fenced Markdown code blocks in any text field.
- Never write Markdown fence markers in any text field.
- Put executable code only in code_example as plain raw code text. Put explanations in normal prose fields.
- Keep explanations useful but concise to reduce unnecessary token usage.

Schema:
{
  "title": "Clear concise course title",
  "description": "2-3 sentence overview with what students will build and why it matters",
  "course_type": "HTML" | "CSS" | "JS" | "Fullstack",
  "level": "Beginner" | "Intermediate" | "Advanced",
  "image_url": "A relevant high quality Unsplash tech image URL",
  "media_type": "picture",
  "code_example_title": "Title of the starter code",
  "code_example_explanation": "Story-based explanation of the code, including why each important line exists and what to try changing",
  "code_example": "Complete working raw HTML/CSS/JS code with clean indentation and no Markdown fences",
  "lesson_recall": {
    "title": "Lesson title",
    "whatsapp_session_title": "WhatsApp session title",
    "whatsapp_date": "Today, 8:00 PM",
    "body": "A clear story-based lesson with Why, How the browser thinks, alternatives, if/else reasoning where relevant, mistakes, and a mini experiment. Do not use Markdown fences.",
    "key_takeaways": ["Reason 1", "Reason 2", "Reason 3"]
  },
  "task": {
    "title": "Practical task title",
    "instructions": "Step-by-step task instructions that explain the reason for each requirement",
    "points": 50,
    "requirements": [
      { "id": "req_1", "description": "Requirement with its reason", "target": "h1", "expected": "present" },
      { "id": "req_2", "description": "Requirement with its reason", "target": "p", "expected": "present" }
    ]
  },
  "quiz": {
    "question": "A why-focused multiple-choice question",
    "options": [{ "id": "A", "text": "Option A" }, { "id": "B", "text": "Option B" }, { "id": "C", "text": "Option C" }, { "id": "D", "text": "Option D" }],
    "correct_option": "A",
    "explanation": "Explain why the answer is correct and why the alternatives are less suitable"
  }
}`;

    const userPrompt = `Topic: "${topic.trim()}"
Language/Domain: ${courseType}
Target Level: ${targetLevel}
Additional Instructor Notes: ${additionalNotes || 'Standard community curriculum'}`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      config: { responseMimeType: 'application/json', maxOutputTokens: 6000 },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseErr) {
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({ success: true, model: selectedModel, draft: parsedData });
  } catch (error: any) {
    console.error('Gemini Course Generation Error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate course with Gemini AI.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Learn2Code Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
