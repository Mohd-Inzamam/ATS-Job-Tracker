import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        label: {
            type: String,
            required: true,
            trim: true
        },

        targetRole: {
            type: String,
            trim: true
        },

        version: {
            type: Number,
            default: 1
        },

        isActive: {
            type: Boolean,
            default: false
        },

        fileName: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        fileType: {
            type: String,
            enum: ["pdf", "docx"],
            required: true
        },

        parsedText: {
            type: String,
            required: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
