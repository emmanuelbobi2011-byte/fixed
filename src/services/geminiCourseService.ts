export interface GeminiCourseDraft {
  title: string;
  description: string;
  course_type: 'html' | 'css' | 'js' | 'fullstack';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  image_url: string;
  media_type: 'picture' | 'video' | 'presentation' | 'gif';
  code_example_title: string;
  code_example_explanation: string;
  code_example: string;
  lesson_recall: {
    title: string;
    whatsapp_session_title: string;
    whatsapp_date: string;
    body: string;
    key_takeaways: string[];
  };
  task: {
    title: string;
    instructions: string;
    points: number;
    requirements: {
      id: string;
      description: string;
      target: string;
      expected: string;
    }[];
  };
  quiz: {
    question: string;
    options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
    correct_option: 'A' | 'B' | 'C' | 'D';
    explanation: string;
  };
}

export interface GenerateCourseOptions {
  topic: string;
  courseType?: 'html' | 'css' | 'js' | 'fullstack';
  targetLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  additionalNotes?: string;
  apiKey?: string;
  model?: string;
}

export const TECH_PICTURE_PRESETS = [
  {
    title: 'Modern Web Workspace',
    category: 'General',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Code Syntax on Display',
    category: 'HTML & CSS',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'UI & Layout Wireframes',
    category: 'Design & CSS',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Dark IDE & Terminal',
    category: 'JavaScript',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Logic & Code Matrix',
    category: 'Algorithms & JS',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Mobile Responsive Preview',
    category: 'Fullstack & Mobile',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Software Engineering Setup',
    category: 'Fullstack',
    url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80',
  },
];

export const GeminiCourseService = {
  getStoredApiKey(): string {
    return localStorage.getItem('learn2code_admin_gemini_key') || '';
  },

  setStoredApiKey(key: string): void {
    if (key) {
      localStorage.setItem('learn2code_admin_gemini_key', key.trim());
    } else {
      localStorage.removeItem('learn2code_admin_gemini_key');
    }
  },

  /**
   * Main function to generate a course with Gemini Flash
   */
  async generateCourse(options: GenerateCourseOptions): Promise<GeminiCourseDraft> {
    const apiKey = options.apiKey?.trim() || this.getStoredApiKey();
    const model = options.model || 'gemini-3.8-flash';

    // 1. Try the server route first if available
    try {
      const res = await fetch('/api/ai/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: options.topic,
          courseType: options.courseType || 'HTML',
          targetLevel: options.targetLevel || 'Beginner',
          additionalNotes: options.additionalNotes || '',
          apiKey: apiKey,
          model: model,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.draft) {
          return this.sanitizeDraft(data.draft, options);
        }
      }
    } catch (serverErr) {
      console.warn('Server proxy unavailable, attempting direct client API call...', serverErr);
    }

    // 2. Client-side fallback using direct Google Generative Language API
    if (!apiKey) {
      throw new Error(
        'Gemini API key is required. Please enter your Gemini API key in the admin AI generator box.'
      );
    }

    const systemInstruction = `You are an expert curriculum developer and coding educator for "Learn2Code", a community coding education platform for students learning via WhatsApp lectures and a live web Code Lab.
Generate a complete, practical course syllabus for the given topic.
Respond ONLY with valid, raw JSON with NO markdown code fences.

The JSON schema MUST match:
{
  "title": "Clear concise course title",
  "description": "2-3 sentences overview describing what students will build and understand",
  "course_type": "html" | "css" | "js" | "fullstack",
  "level": "Beginner" | "Intermediate" | "Advanced",
  "image_url": "High quality Unsplash tech image URL",
  "media_type": "picture",
  "code_example_title": "Title of the starter code snippet",
  "code_example_explanation": "Explanation of how the code works and what students can tweak",
  "code_example": "A complete, working HTML/CSS/JS starter code snippet with clean indentation",
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
        "description": "Requirement 1 (e.g. Must include an <h1> tag)",
        "target": "h1",
        "expected": "present"
      },
      {
        "id": "req_2",
        "description": "Requirement 2 (e.g. Must include a container with styles)",
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

    const userPrompt = `Topic: "${options.topic.trim()}"
Language/Domain: ${options.courseType || 'html'}
Target Level: ${options.targetLevel || 'Beginner'}
Additional Instructor Notes: ${options.additionalNotes || 'Standard community curriculum'}`;

    // Query Gemini REST endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    const directRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!directRes.ok) {
      const errData = await directRes.json().catch(() => ({}));
      const msg = errData?.error?.message || `Gemini API returned status ${directRes.status}`;
      throw new Error(msg);
    }

    const data = await directRes.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('Gemini did not return any content for the course.');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(candidate.trim());
    } catch (e) {
      const clean = candidate.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      parsed = JSON.parse(clean);
    }

    return this.sanitizeDraft(parsed, options);
  },

  /**
   * Helper to ensure all required fields are present with sensible fallbacks
   */
  sanitizeDraft(raw: any, options: GenerateCourseOptions): GeminiCourseDraft {
    const type = (raw.course_type?.toLowerCase() || options.courseType || 'html') as 'html' | 'css' | 'js' | 'fullstack';
    
    // Pick an appropriate default photo if none or invalid
    let pic = raw.image_url;
    if (!pic || !pic.startsWith('http')) {
      const matchingPreset = TECH_PICTURE_PRESETS.find(p => p.category.toLowerCase().includes(type)) || TECH_PICTURE_PRESETS[0];
      pic = matchingPreset.url;
    }

    return {
      title: raw.title?.trim() || options.topic.trim(),
      description: raw.description?.trim() || `Practical guide to mastering ${options.topic.trim()}.`,
      course_type: ['html', 'css', 'js', 'fullstack'].includes(type) ? type : 'html',
      level: ['Beginner', 'Intermediate', 'Advanced'].includes(raw.level) ? raw.level : 'Beginner',
      image_url: pic,
      media_type: 'picture',
      code_example_title: raw.code_example_title?.trim() || 'Starter Code Sandbox',
      code_example_explanation: raw.code_example_explanation?.trim() || 'Examine this code to understand the underlying structure.',
      code_example: raw.code_example?.trim() || `<!DOCTYPE html>\n<html>\n<head>\n  <title>${options.topic}</title>\n</head>\n<body>\n  <h1>${options.topic}</h1>\n</body>\n</html>`,
      lesson_recall: {
        title: raw.lesson_recall?.title?.trim() || `${raw.title || options.topic} — Lesson Recall`,
        whatsapp_session_title: raw.lesson_recall?.whatsapp_session_title?.trim() || `${raw.title || options.topic} WhatsApp Session`,
        whatsapp_date: raw.lesson_recall?.whatsapp_date?.trim() || 'Today, 8:00 PM',
        body: raw.lesson_recall?.body?.trim() || `### Overview of ${options.topic}\n\nReview this lesson recall to solidify your understanding.`,
        key_takeaways: Array.isArray(raw.lesson_recall?.key_takeaways) && raw.lesson_recall.key_takeaways.length > 0
          ? raw.lesson_recall.key_takeaways
          : [
              `Master core concepts of ${options.topic}`,
              'Experiment with code directly inside the Code Lab',
              'Participate in WhatsApp group code discussions',
            ],
      },
      task: {
        title: raw.task?.title?.trim() || `Practical Assignment: ${raw.title || options.topic}`,
        instructions: raw.task?.instructions?.trim() || `Open the Code Lab and write code that demonstrates ${options.topic}. Submit your project for automatic verification.`,
        points: typeof raw.task?.points === 'number' ? raw.task.points : 50,
        requirements: Array.isArray(raw.task?.requirements) && raw.task.requirements.length > 0
          ? raw.task.requirements.map((r: any, idx: number) => ({
              id: r.id || `req_ai_${idx + 1}`,
              description: r.description || `Implement requirement #${idx + 1}`,
              target: r.target || (type === 'css' ? 'body' : 'h1'),
              expected: r.expected || 'present',
            }))
          : [
              { id: 'req_ai_1', description: `Must implement main ${options.topic} element`, target: 'h1', expected: 'present' },
              { id: 'req_ai_2', description: 'Must contain descriptive paragraph', target: 'p', expected: 'present' },
            ],
      },
      quiz: {
        question: raw.quiz?.question?.trim() || `What is the primary purpose of ${options.topic}?`,
        options: Array.isArray(raw.quiz?.options) && raw.quiz.options.length === 4
          ? raw.quiz.options
          : [
              { id: 'A', text: `To structure and implement ${options.topic} cleanly` },
              { id: 'B', text: 'To delete styling from the browser' },
              { id: 'C', text: 'To run arbitrary server restarts' },
              { id: 'D', text: 'None of the above' },
            ],
        correct_option: ['A', 'B', 'C', 'D'].includes(raw.quiz?.correct_option) ? raw.quiz.correct_option : 'A',
        explanation: raw.quiz?.explanation?.trim() || `Option A accurately describes the standard usage of ${options.topic}.`,
      },
    };
  },
};
