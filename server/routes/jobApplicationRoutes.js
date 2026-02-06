import express from "express";
import {
    createApplication,
    getApplications,
    updateApplicationStatus,
    deleteApplication
} from "../controller/jobApplicationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router
    .route("/")
    .post(protect, createApplication)
    .get(protect, getApplications);

router
    .route("/:id")
    .put(protect, updateApplicationStatus)
    .delete(protect, deleteApplication);

export default router;
