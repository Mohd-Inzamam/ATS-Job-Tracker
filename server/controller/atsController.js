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

        res.json({
            atsScore: analysis.score,
            wordCount: analysis.wordCount,
            suggestions: analysis.suggestions
        });
    } catch (error) {
        console.error("Error during ATS check:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
