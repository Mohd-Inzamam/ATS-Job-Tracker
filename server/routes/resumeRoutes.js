import express from "express";
import {
    uploadResume,
    getResumes,
    deleteResume
} from "../controller/resumeController.js";
import protect from "../middleware/authMiddleware.js";
import { checkResumeLimit } from "../middleware/planMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router
    .route("/")
    .post(protect, checkResumeLimit, upload.single("resume"), uploadResume)
    .get(protect, getResumes);

router.route("/:id").delete(protect, deleteResume);

export default router;
