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
    const activeModel = checkout?.slot.activeModel || 'gemini-3.6-flash';

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

      // Valid Google Gemini API model IDs - prioritizing operational Gemini 3.x models
      const rawFleet = [activeModel, 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.7-flash'];
      const uniqueModels = Array.from(new Set(rawFleet))
        .filter((m): m is string => Boolean(m) && !m.includes('1.5') && !m.includes('2.0') && !m.includes('2.5'));
      if (uniqueModels.length === 0) {
        uniqueModels.push('gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest');
      }

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
    return `You are an expert ATS recruitment AI. Assess the following candidate resumes against the job description with high accuracy.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUMES:
${resumeTexts}

INSTRUCTIONS:
1. Extract the candidate's real full name directly from their resume text (do NOT use placeholder names).
2. Thoroughly analyze candidate experience, technical skills, certifications, and education against the specific requirements in the JOB DESCRIPTION.
3. Calculate an accurate match_score (0 to 100) reflecting their actual suitability for the role.
4. matched_skills must contain only skills that exist in BOTH the resume and the job description.
5. missing_skills must contain key skills required by the job description that the candidate lacks.
6. Provide specific, tailored strengths, weaknesses, executive summary, and 2-3 technical interview questions based on their actual background.
7. Return ONLY a valid JSON array of candidate objects, one per resume provided, in the same order.

JSON Structure:
[
  {
    "candidate_name": "Extracted Full Name",
    "match_score": 88,
    "is_relevant": true,
    "experience_level": "Senior",
    "experience_years": 6,
    "education": "B.S. in Computer Science",
    "skills": ["C#", ".NET Core", "SQL", "Docker"],
    "matched_skills": ["C#", ".NET Core", "SQL"],
    "missing_skills": ["Kubernetes"],
    "summary": "2-3 sentence executive evaluation summary explaining role fit",
    "recommendation": "Advance to technical interview round.",
    "salary_range": "$120,000 - $145,000",
    "contact_info": {
      "email": "candidate@example.com",
      "phone": "(555) 000-0000"
    },
    "hire_probability": 0.88,
    "strengths": ["Demonstrated mastery in required backend stack"],
    "weaknesses": ["Limited cloud deployment experience"],
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