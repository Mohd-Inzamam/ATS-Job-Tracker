import { analyzeATS } from "../utils/atsScorer.js";
import { parseResume } from "../utils/resumeParser.js";

export const publicATSCheck = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const fileType = req.file.originalname.split(".").pop().toLowerCase();
        const parsedText = await parseResume(req.file.path, fileType);

        const analysis = analyzeATS(parsedText);
        console.log("ATS Analysis Result:", analysis);

        const sections = [
            {
                title: "Section Structure",
                feedback: analysis.suggestions.find(s => s.includes("section")) ||
                    "✓ Your resume has clear, well-defined sections.",
                passed: !analysis.suggestions.some(s => s.includes("section"))
            },
            {
                title: "Action Verbs & Keywords",
                feedback: analysis.suggestions.find(s => s.includes("action verb")) ||
                    "✓ Good use of action verbs throughout your resume.",
                passed: !analysis.suggestions.some(s => s.includes("action verb"))
            },
            {
                title: "ATS Formatting",
                feedback: analysis.suggestions.find(s => s.includes("table") || s.includes("column")) ||
                    "✓ No ATS-breaking formatting detected.",
                passed: !analysis.suggestions.some(s => s.includes("table") || s.includes("column"))
            },
            {
                title: "Content Length",
                feedback: analysis.suggestions.find(s => s.includes("content") || s.includes("short")) ||
                    `✓ Good content density (${analysis.wordCount} words).`,
                passed: !analysis.suggestions.some(s => s.includes("content") || s.includes("short"))
            }
        ];

        res.json({
            atsScore: analysis.score,
            wordCount: analysis.wordCount,
            suggestions: analysis.suggestions,
            sections
        });
    } catch (error) {
        console.error("Error during ATS check:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
