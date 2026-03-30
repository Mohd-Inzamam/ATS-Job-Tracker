import express from "express";
import {
    getOverview,
    getApplicationTrends,
    getResumePerformance,
    getSuccessRate
} from "../controller/analyticsController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET  /api/analytics/overview          → total apps, status breakdown, conversion rates
// GET  /api/analytics/trends            → applications grouped by week
// POST /api/analytics/resume-performance → compare all resumes against a JD
// GET  /api/analytics/success-rate      → interview/offer rate by role and company

router.get("/overview", protect, getOverview);
router.get("/trends", protect, getApplicationTrends);
router.post("/resume-performance", protect, getResumePerformance);
router.get("/success-rate", protect, getSuccessRate);

export default router;