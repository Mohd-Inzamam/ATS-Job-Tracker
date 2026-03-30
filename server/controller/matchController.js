import Resume from "../models/Resume.js";
import JobApplication from "../models/JobApplication.js";
import { calculateMatch } from "../utils/matchScorer.js";


// @desc    Match a resume against a job description directly
// @route   POST /api/match/analyze
// @access  Private
export const analyzeMatch = async (req, res) => {
    try {
        const { resumeId, jobDescription } = req.body;

        if (!resumeId || !jobDescription) {
            return res.status(400).json({
                message: "Resume ID and job description are required"
            });
        }

        const resume = await Resume.findById(resumeId);

        if (!resume || resume.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: "Resume not found" });
        }

        if (!resume.parsedText) {
            return res.status(400).json({
                message: "Resume has no parsed content to analyze"
            });
        }

        const result = calculateMatch(resume.parsedText, jobDescription);

        res.status(200).json({
            resumeLabel: resume.label,
            ...result
        });
    } catch (error) {
        console.error("Error analyzing match:", error);
        res.status(500).json({ message: "Failed to analyze match" });
    }
};


// @desc    Match resume against a saved job application's JD
// @route   POST /api/match/application/:applicationId
// @access  Private
export const matchWithApplication = async (req, res) => {
    try {
        const application = await JobApplication.findById(
            req.params.applicationId
        ).populate("resume");

        if (
            !application ||
            application.user.toString() !== req.user._id.toString()
        ) {
            return res.status(404).json({ message: "Application not found" });
        }

        const resume = application.resume;

        if (!resume || !resume.parsedText) {
            return res.status(400).json({
                message: "No resume content available for this application"
            });
        }

        const result = calculateMatch(
            resume.parsedText,
            application.jobDescription
        );

        res.status(200).json({
            companyName: application.companyName,
            jobTitle: application.jobTitle,
            resumeLabel: resume.label,
            ...result
        });
    } catch (error) {
        console.error("Error matching with application:", error);
        res.status(500).json({ message: "Failed to match resume with application" });
    }
};