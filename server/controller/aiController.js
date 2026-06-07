import {
    parseJDWithAI,
    explainMatchWithAI,
    generateDashboardInsight
} from "../utils/aiUtils.js";

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

// @desc    Generate AI dashboard insight
// @route   POST /api/ai/dashboard-insight
// @access  Private
export const dashboardInsight = async (req, res) => {
    const {
        totalApplications,
        interviewRate,
        statusBreakdown,
        resumeCount,
        topResumeLabel
    } = req.body;

    try {
        const insight = await generateDashboardInsight({
            totalApplications: totalApplications ?? 0,
            interviewRate: interviewRate ?? 0,
            statusBreakdown: statusBreakdown ?? {},
            resumeCount: resumeCount ?? 0,
            topResumeLabel: topResumeLabel ?? ""
        });
        return res.status(200).json({ insight });
    } catch (error) {
        console.error("aiController dashboard insight error:", error);
        return res.status(200).json({
            insight:
                "Keep going — consistent applications compound over time. Focus on tailoring your resume for each role you apply to."
        });
    }
};
