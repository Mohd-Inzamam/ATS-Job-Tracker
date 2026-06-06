import Groq from "groq-sdk";

// @desc    Parse job description with AI
// @route   POST /api/ai/parse-jd
// @access  Private
export const parseJobDescription = async (req, res) => {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
        return res.status(400).json({ message: "Job description must be at least 50 characters" });
    }

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

        // Strip any accidental markdown code fences before parsing
        const cleaned = rawText.replace(/```json|```/g, "").trim();

        const parsed = JSON.parse(cleaned);

        return res.status(200).json(parsed);
    } catch (error) {
        console.error("AI parse error (soft-fail):", error.message ?? error);
        // Soft failure — return empty structure so the form always works
        return res.status(200).json({
            companyName: "",
            jobTitle: "",
            skills: [],
            seniority: ""
        });
    }
};
