import Groq from "groq-sdk";

/**
 * Parses job description with AI to extract structured info
 * @param {string} jobDescription 
 * @returns {Promise<object>}
 */
export const parseJDWithAI = async (jobDescription) => {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            max_tokens: 500,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a job description parser. Extract structured data from job descriptions. Always respond with valid JSON only. No explanation, no markdown, no code fences, just raw JSON."
                },
                {
                    role: "user",
                    content: `Parse this job description and return JSON with exactly these fields:
{
  "companyName": "string (company name, or empty string if not found)",
  "jobTitle": "string (exact job title)",
  "skills": ["array of top 8 technical skills or requirements, short phrases only"],
  "seniority": "string (one of: Intern, Junior, Mid, Senior, Lead, or empty string if unclear)"
}

Job Description:
${jobDescription}`
                }
            ]
        });

        const rawText = completion.choices[0]?.message?.content ?? "";
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("AI parse error (soft-fail):", error.message ?? error);
        return {
            companyName: "",
            jobTitle: "",
            skills: [],
            seniority: ""
        };
    }
};

/**
 * Generates structured career advice based on matching metrics
 * @param {object} params
 * @returns {Promise<object>}
 */
export const explainMatchWithAI = async ({
    matchPercentage,
    matchedKeywords,
    missingKeywords,
    jobTitle,
    resumeLabel
}) => {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.4,
            max_tokens: 600,
            messages: [
                {
                    role: "system",
                    content: "You are a career coach and resume expert. Give specific, actionable resume advice. Be direct and concise. Always respond with valid JSON only — no markdown, no explanation."
                },
                {
                    role: "user",
                    content: `A candidate's resume has a ${matchPercentage}% match with a ${jobTitle || "job"} position.

Matched keywords: ${matchedKeywords?.join(", ") || "none"}
Missing keywords: ${missingKeywords?.join(", ") || "none"}
Resume label: ${resumeLabel || "their resume"}

Return JSON with exactly these fields:
{
  "verdict": "one sentence overall assessment (e.g. 'Strong match — minor gaps in cloud skills')",
  "quickWins": ["2-3 specific resume changes that would immediately improve this score, each under 15 words"],
  "missingSkillsContext": "one sentence explaining why the missing keywords matter for this role",
  "shouldApply": true or false
}`
                }
            ]
        });

        const rawText = completion.choices[0]?.message?.content ?? "";
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("AI explain match error (soft-fail):", error.message ?? error);
        return {
            verdict: "Good foundation — tailor your resume to highlight relevant skills.",
            quickWins: [
                "Add missing keywords naturally into your experience bullets",
                "Quantify achievements where possible"
            ],
            missingSkillsContext: "Matching the JD's language improves ATS pass-through rates.",
            shouldApply: matchPercentage >= 40
        };
    }
};

/**
 * Generates interview questions and tips using AI
 * @param {object} params
 * @returns {Promise<object>}
 */
export const generateInterviewPrepWithAI = async ({
    jobTitle,
    companyName,
    jobDescription,
    matchedKeywords,
    missingKeywords,
    resumeLabel
}) => {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            max_tokens: 1200,
            messages: [
                {
                    role: "system",
                    content: "You are an expert interview coach. Generate realistic, role-specific interview questions with concise model answers. Always respond with valid JSON only — no markdown, no explanation, no code fences."
                },
                {
                    role: "user",
                    content: `Generate interview prep for a candidate interviewing for: ${jobTitle} at ${companyName || "this company"}.

Their resume label: ${resumeLabel || "their resume"}
Keywords they matched: ${matchedKeywords?.slice(0, 8).join(", ") || "general skills"}
Keywords they are missing: ${missingKeywords?.slice(0, 5).join(", ") || "none"}

Return JSON with exactly this structure:
{
  "questions": [
    {
      "type": "Technical" | "Behavioural" | "Culture Fit",
      "question": "the interview question",
      "hint": "a concise model answer or talking points in 1-2 sentences"
    }
  ],
  "tipsForThisRole": ["2-3 short role-specific interview tips"],
  "watchOutFor": "one sentence on a likely tough question or gap they should prepare for"
}

Generate exactly 6 questions: 3 Technical, 2 Behavioural, 1 Culture Fit.`
                }
            ]
        });

        const rawText = completion.choices[0]?.message?.content ?? "";
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("AI interview prep error (soft-fail):", error.message ?? error);
        return {
            questions: [
                { type: "Technical", question: "Walk me through your most relevant project for this role.", hint: "Focus on technologies used and measurable impact." },
                { type: "Technical", question: "How do you approach debugging a production issue?", hint: "Describe your systematic process: reproduce, isolate, fix, verify." },
                { type: "Technical", question: "What's your experience with the core technologies in this role?", hint: "Map your experience directly to the job requirements." },
                { type: "Behavioural", question: "Tell me about a time you handled a tight deadline.", hint: "Use STAR format: Situation, Task, Action, Result." },
                { type: "Behavioural", question: "Describe a conflict with a teammate and how you resolved it.", hint: "Focus on communication and the positive outcome." },
                { type: "Culture Fit", question: "Why do you want to work at this company specifically?", hint: "Research their mission, recent news, and product direction." }
            ],
            tipsForThisRole: [
                "Research the company's recent projects and tech stack",
                "Prepare 2-3 questions to ask the interviewer",
                "Practice your answers out loud before the interview"
            ],
            watchOutFor: "Be ready to explain any gaps between your skills and the job requirements."
        };
    }
};

/**
 * Generates a semantic quality assessment of resume content that rules
 * structurally cannot judge — bullet impact, clarity, and specificity.
 * This sits ALONGSIDE the rule-based score, not in place of it: rules
 * give a deterministic floor (sections present, verbs used, length),
 * AI adds judgment on the writing itself.
 *
 * @param {object} params
 * @returns {Promise<{ qualityScore: number, strengths: string[], weakBullets: object[], overallTone: string }>}
 */
export const generateATSQualityInsightWithAI = async ({ resumeText, ruleScore }) => {
    const fallback = {
        qualityScore: Math.round(ruleScore * 0.7), // conservative fallback tied to rule score
        strengths: [],
        weakBullets: [],
        overallTone: "",
    };

    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // Cap input so we stay well inside token limits and keep latency low —
        // the first ~3500 chars of a resume covers summary + most of experience
        // for the vast majority of real resumes.
        const trimmedText = resumeText.slice(0, 3500);

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            max_tokens: 700,
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert resume reviewer judging WRITING QUALITY only — not formatting or keywords, which are scored separately by a rules engine. Judge clarity, specificity, and impact of the actual sentences. Always respond with valid JSON only — no markdown, no code fences, no explanation."
                },
                {
                    role: "user",
                    content: `Review this resume's writing quality. Ignore formatting, fonts, and section structure — those are already scored elsewhere. Focus only on whether the bullet points and descriptions are specific, quantified, and impactful versus vague and generic.

Resume text:
${trimmedText}

Return JSON with exactly these fields:
{
  "qualityScore": <integer 0-100, how strong the WRITING is, independent of formatting>,
  "strengths": ["1-3 short phrases naming what's genuinely well-written, e.g. 'Strong quantified impact in the experience section'"],
  "weakBullets": [
    {
      "original": "a short excerpt (under 20 words) of a vague/weak bullet found in the text, or empty string if none found",
      "issue": "one short phrase naming the problem, e.g. 'No measurable outcome'",
      "rewriteSuggestion": "a concise rewritten version of that same bullet that is more specific and impactful, under 20 words"
    }
  ],
  "overallTone": "one sentence describing the overall writing quality in plain language"
}

Identify at most 3 weak bullets. If the resume text is too short or unclear to assess meaningfully, return qualityScore based on what's visible and an empty weakBullets array.`
                }
            ]
        });

        const rawText = completion.choices[0]?.message?.content ?? "";
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        // Defensive shape-check — never let a malformed AI response leak
        // into the response contract the frontend depends on.
        return {
            qualityScore: Number.isFinite(parsed.qualityScore)
                ? Math.max(0, Math.min(100, Math.round(parsed.qualityScore)))
                : fallback.qualityScore,
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
            weakBullets: Array.isArray(parsed.weakBullets) ? parsed.weakBullets.slice(0, 3) : [],
            overallTone: typeof parsed.overallTone === "string" ? parsed.overallTone : "",
        };
    } catch (error) {
        console.error("AI ATS quality insight error (soft-fail):", error.message ?? error);
        return fallback;
    }
};

/**
 * Generates a brief dashboard insight for the job seeker
 * @param {object} params
 * @returns {Promise<string>}
 */
export const generateDashboardInsight = async ({
    totalApplications,
    interviewRate,
    statusBreakdown,
    resumeCount,
    topResumeLabel
}) => {
    const fallback =
        "Keep going — consistent applications compound over time. Focus on tailoring your resume for each role you apply to.";

    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 120,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a supportive career coach giving a job seeker a brief, encouraging, data-driven insight. Be specific, warm, and actionable. 2-3 sentences max. No bullet points. No JSON."
                },
                {
                    role: "user",
                    content: `The candidate has ${totalApplications} applications total.
Status breakdown: ${JSON.stringify(statusBreakdown)}.
Interview conversion rate: ${interviewRate}%.
They have ${resumeCount} resume(s). Best resume: ${topResumeLabel || "not uploaded yet"}.
Give them one specific, encouraging insight about their job search progress and one concrete next step.`
                }
            ]
        });

        const text = completion.choices[0]?.message?.content?.trim();
        return text || fallback;
    } catch (error) {
        console.error("AI dashboard insight error (soft-fail):", error.message ?? error);
        return fallback;
    }
};