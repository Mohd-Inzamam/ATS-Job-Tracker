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

