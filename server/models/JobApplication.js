import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true
        },

        companyName: {
            type: String,
            required: true,
            trim: true
        },

        jobTitle: {
            type: String,
            required: true,
            trim: true
        },

        jobDescription: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Saved", "Applied", "Interview", "Offer", "Rejected"],
            default: "Saved"
        },

        matchScore: {
            type: Number,
            default: null
        },

        matchedKeywords: {
            type: [String],
            default: []
        },

        missingKeywords: {
            type: [String],
            default: []
        },

        aiExplanation: {
            verdict: { type: String, default: "" },
            quickWins: { type: [String], default: [] },
            missingSkillsContext: { type: String, default: "" },
            shouldApply: { type: Boolean, default: true }
        },

        interviewPrep: {
            questions: [{
                type: { type: String },
                question: { type: String },
                hint: { type: String }
            }],
            tipsForThisRole: { type: [String], default: [] },
            watchOutFor: { type: String, default: "" },
            generatedAt: { type: Date, default: null }
        }
    },
    { timestamps: true }
);

const JobApplication = mongoose.model(
    "JobApplication",
    jobApplicationSchema
);

export default JobApplication;
