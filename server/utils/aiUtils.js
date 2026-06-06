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
