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
        }
    },
    { timestamps: true }
);

const JobApplication = mongoose.model(
    "JobApplication",
    jobApplicationSchema
);

export default JobApplication;
