import express from "express";
import {
    createApplication,
    getApplications,
    updateApplicationStatus,
    deleteApplication
} from "../controller/jobApplicationController.js";
import protect from "../middleware/authMiddleware.js";
import { checkApplicationLimit } from "../middleware/planMiddleware.js";

const router = express.Router();

router
    .route("/")
    .post(protect, checkApplicationLimit, createApplication)
    .get(protect, getApplications);

router
    .route("/:id")
    .put(protect, updateApplicationStatus)
    .delete(protect, deleteApplication);

export default router;
