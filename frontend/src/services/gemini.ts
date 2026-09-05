import { KeyPoolSynchronizer } from './keyPoolSync';
import { API_BASE } from './apiConfig';

const ENV_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

export interface AIAnalysisResult {
  rawOutput: string;
  slotInfo?: {
    id: string;
    name: string;
    maskedKey: string;
    activeModel: string;
    latencyMs: number;
    queuePosition: number;
  };
}

export class GeminiService {
  /**
   * Execute AI resume evaluation through the Multi-Key Round-Robin Pool with real-time lock & release synchronization
   */
  static async analyzeResumes(
    jobDescription: string,
    resumeTexts: string,
    userId = 'recruiter-session',
    onProgressUpdate?: (info: { statusText: string; engineInfo?: string; keySlot?: string }) => void
  ): Promise<AIAnalysisResult> {
    const prompt = this.createAnalysisPrompt(jobDescription, resumeTexts);
    const startTime = Date.now();

    // 1. Checkout & Lock Slot in Real-Time Key Pool
    const checkout = KeyPoolSynchronizer.checkoutSlot(userId);
    const allocatedKeyName = checkout?.slot.name || 'Primary Gemini Key';
    const allocatedMask = checkout?.slot.maskedKey || 'AIzaSy...****';
    const targetApiKey = checkout?.rawKey || ENV_GEMINI_KEY || '';
    const activeModel = checkout?.slot.activeModel || 'gemini-2.5-flash';

    if (onProgressUpdate) {
      onProgressUpdate({
        statusText: `Allocated ${allocatedKeyName} [${activeModel}]`,
        engineInfo: `Slot Locked (In-Flight) - Real-Time Dispatcher`,
        keySlot: `${allocatedKeyName} (${allocatedMask})`
      });
    }

    try {
      // 2. Primary Route: Server Multi-Key Analysis API
      try {
        const poolResponse = await fetch(`${API_BASE}/analysis/ai-screen`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            userId,
            operationType: 'AI_RESUME_EVALUATION'
          })
        });

        if (poolResponse.ok) {
          const poolData = await poolResponse.json();
          if (poolData.success && poolData.data?.rawOutput) {
            const latency = Date.now() - startTime;
            const slotData = poolData.data.slotInfo || {
              id: checkout?.slot.id || 'slot_1',
              name: allocatedKeyName,
              maskedKey: allocatedMask,
              activeModel,
              latencyMs: latency,
              queuePosition: (checkout?.slot.queuePosition || 0) + 25
            };

            return {
              rawOutput: poolData.data.rawOutput,
              slotInfo: slotData
            };
          }
        }
      } catch (backendErr) {
        console.warn('[GeminiService] Server endpoint unavailable, using direct client dispatch:', backendErr);
      }

      // 3. Fallback Route: Direct Client Call using Allocated Pool Key
      if (!targetApiKey || targetApiKey.trim().length < 8) {
        throw new Error('No valid Gemini API key found. Please add a key in the Admin Console (Multi-API Key Pool).');
      }

      // Valid Google Gemini API model IDs
      const modelFleet = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', activeModel].filter(Boolean);
      const uniqueModels = Array.from(new Set(modelFleet));

      for (const model of uniqueModels) {
        try {
          if (onProgressUpdate) {
            onProgressUpdate({
              statusText: `Evaluating candidates via ${allocatedKeyName} [${model}]...`,
              engineInfo: `Key ${allocatedMask} Locked (In-Flight Evaluation)`,
              keySlot: allocatedKeyName
            });
          }

          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${targetApiKey.trim()}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 8192,
                response_mime_type: "application/json"
              }
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`[GeminiService] Model ${model} error (${response.status}):`, errorData);
            continue;
          }

          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (rawText && rawText.trim().length > 0) {
            const latency = Date.now() - startTime;
            return {
              rawOutput: rawText,
              slotInfo: {
                id: checkout?.slot.id || 'slot_1',
                name: allocatedKeyName,
                maskedKey: allocatedMask,
                activeModel: model,
                latencyMs: latency,
                queuePosition: (checkout?.slot.queuePosition || 0) + 25
              }
            };
          }
        } catch (callErr) {
          console.warn(`[GeminiService] Direct call error on ${model}:`, callErr);
        }
      }

      throw new Error('AI analysis failed across all models. Please verify that your Gemini API Key in the Admin Pool is active.');

    } finally {
      // 4. Guaranteed Slot Release in Real-Time Key Pool
      if (checkout?.slot.id) {
        const totalDuration = Date.now() - startTime;
        KeyPoolSynchronizer.releaseSlot(checkout.slot.id, totalDuration);
      }
    }
  }

  private static createAnalysisPrompt(jobDescription: string, resumeTexts: string): string {
    return `You are an expert ATS recruitment AI. Assess the following candidate resumes against the job description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUMES:
${resumeTexts}

INSTRUCTIONS:
Evaluate every candidate thoroughly and return a valid JSON array of objects.
Do not include any explanation or intro text. Output ONLY the JSON array starting with [ and ending with ].

JSON Structure:
[
  {
    "candidate_name": "Candidate Full Name",
    "match_score": 88,
    "is_relevant": true,
    "experience_level": "Senior",
    "experience_years": 6,
    "education": "B.S. in Computer Science",
    "skills": ["React", "TypeScript", "Node.js", "Docker"],
    "matched_skills": ["React", "TypeScript", "Node.js"],
    "missing_skills": ["Kubernetes"],
    "summary": "2-3 sentence executive evaluation summary",
    "recommendation": "Hire recommendation note",
    "salary_range": "$140,000 - $170,000",
    "contact_info": {
      "email": "candidate@example.com",
      "phone": "(555) 000-0000"
    },
    "hire_probability": 0.88,
    "strengths": ["Strong engineering fundamentals"],
    "weaknesses": ["Minor gap in cloud architecture"],
    "interview_questions": [
      "How do you design scalable REST APIs?"
    ],
    "notable_companies": ["Tech Corp"],
    "certifications": ["AWS Certified"],
    "skill_diversity": 0.85,
    "company_prestige": 0.80,
    "issues_detected": []
  }
]`;
  }
}