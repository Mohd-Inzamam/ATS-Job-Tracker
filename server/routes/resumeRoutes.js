import express from "express";
import {
    uploadResume,
    getResumes,
    deleteResume
} from "../controller/resumeController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router
    .route("/")
    .post(protect, upload.single("resume"), uploadResume)
    .get(protect, getResumes);

router.route("/:id").delete(protect, deleteResume);

export default router;
