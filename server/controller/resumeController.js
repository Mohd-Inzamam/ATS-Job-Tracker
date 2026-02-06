import Resume from "../models/Resume.js";
import { parseResume } from "../utils/resumeParser.js";
import fs from "fs";


// @desc    Upload resume
// @route   POST /api/resumes
// @access  Private
export const uploadResume = async (req, res) => {
    const { label } = req.body;

    if (!req.file || !label) {
        return res.status(400).json({ message: "Resume file and label required" });
    }

    const fileType = req.file.originalname.split(".").pop().toLowerCase();

    const parsedText = await parseResume(req.file.path, fileType);
    console.log("FILE 👉", req.file);
    console.log("LABEL 👉", req.body.label);
    // console.log("USER 👉", req.user);


    const resume = await Resume.create({
        user: req.user._id,
        label,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileType,
        parsedText
    });

    res.status(201).json(resume);
};



// @desc    Get all resumes of user
// @route   GET /api/resumes
// @access  Private
export const getResumes = async (req, res) => {
    const resumes = await Resume.find({ user: req.user._id });
    res.json(resumes);
};



// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
    }

    fs.unlinkSync(resume.filePath);
    await resume.deleteOne();

    res.json({ message: "Resume deleted successfully" });
};
