import { parseJDWithAI, explainMatchWithAI } from "../utils/aiUtils.js";

// @desc    Parse job description with AI
// @route   POST /api/ai/parse-jd
// @access  Private
export const parseJobDescription = async (req, res) => {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
        return res.status(400).json({ message: "Job description must be at least 50 characters" });
    }

    try {
        const result = await parseJDWithAI(jobDescription);
        return res.status(200).json(result);
    } catch (error) {
        console.error("aiController parse error:", error);
        return res.status(500).json({ message: "Failed to parse job description" });
    }
};

// @desc    Explain match details with AI
// @route   POST /api/ai/explain-match
// @access  Private
export const explainMatch = async (req, res) => {
    const { matchPercentage, matchedKeywords, missingKeywords, jobTitle, resumeLabel } = req.body;

    if (!Array.isArray(missingKeywords) || matchPercentage === undefined) {
        return res.status(400).json({ message: "matchPercentage and missingKeywords are required fields" });
    }

    try {
        const result = await explainMatchWithAI({
            matchPercentage,
            matchedKeywords,
            missingKeywords,
            jobTitle,
            resumeLabel
        });
        return res.status(200).json(result);
    } catch (error) {
        console.error("aiController explain error:", error);
        return res.status(500).json({ message: "Failed to explain match" });
    }
};
