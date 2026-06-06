import JobApplication from "../models/JobApplication.js";
import Resume from "../models/Resume.js";
import { calculateMatch } from "../utils/matchScorer.js";
import { explainMatchWithAI, generateInterviewPrepWithAI } from "../utils/aiUtils.js";


// @desc    Create job application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req, res) => {
    const {
        resumeId,
        companyName,
        jobTitle,
        jobDescription
    } = req.body;

    if (!resumeId || !companyName || !jobTitle || !jobDescription) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume || resume.user.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: "Invalid resume selected" });
    }

    const application = await JobApplication.create({
        user: req.user._id,
        resume: resumeId,
        companyName,
        jobTitle,
        jobDescription
    });

    // Run match analysis against the selected resume
    try {
        const matchResult = calculateMatch(resume.parsedText, jobDescription);
        application.matchScore = matchResult.matchPercentage;
        application.matchedKeywords = matchResult.matchedKeywords;
        application.missingKeywords = matchResult.missingKeywords;

        const aiExplanation = await explainMatchWithAI({
            matchPercentage: matchResult.matchPercentage,
            matchedKeywords: matchResult.matchedKeywords,
            missingKeywords: matchResult.missingKeywords,
            jobTitle,
            resumeLabel: resume.label
        });
        application.aiExplanation = aiExplanation;

        await application.save();
    } catch (matchErr) {
        console.error("Match analysis failed (non-fatal):", matchErr);
    }

    try {
        await application.populate("resume", "label");
    } catch (popErr) {
        console.error("Populate resume failed (non-fatal):", popErr);
    }

    res.status(201).json(application);
};

// ✅ Wrap getApplications
export const getApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find({
            user: req.user._id
        }).populate("resume", "label");
        res.json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
};

// ✅ Wrap updateApplicationStatus
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await JobApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        if (application.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        application.status = status || application.status;

        if (status === "Interview") {
            // Populate resume field to get resume.label
            await application.populate("resume", "label");

            // Generate interview prep
            const prepResult = await generateInterviewPrepWithAI({
                jobTitle: application.jobTitle,
                companyName: application.companyName,
                jobDescription: application.jobDescription,
                matchedKeywords: application.matchedKeywords,
                missingKeywords: application.missingKeywords,
                resumeLabel: application.resume?.label
            });

            application.interviewPrep = {
                ...prepResult,
                generatedAt: new Date()
            };
        }

        const updated = await application.save();

        // Ensure resume path is populated for frontend label display
        if (updated.resume && !updated.populated("resume")) {
            await updated.populate("resume", "label");
        }

        res.json(updated);
    } catch (error) {
        console.error("Error updating application:", error);
        res.status(500).json({ message: "Failed to update application" });
    }
};

// ✅ Wrap deleteApplication
export const deleteApplication = async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        if (application.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await application.deleteOne();
        res.json({ message: "Application deleted" });
    } catch (error) {
        console.error("Error deleting application:", error);
        res.status(500).json({ message: "Failed to delete application" });
    }
};