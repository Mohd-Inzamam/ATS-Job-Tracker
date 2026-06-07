import express from "express";
import {
    analyzeMatch,
    matchWithApplication
} from "../controller/matchController.js";
import protect from "../middleware/authMiddleware.js";
import { checkMatchAccess } from "../middleware/planMiddleware.js";

const router = express.Router();

// POST /api/match/analyze → manual resume + JD match
router.post("/analyze", protect, checkMatchAccess, analyzeMatch);

// POST /api/match/application/:applicationId → match against saved application
router.post("/application/:applicationId", protect, checkMatchAccess, matchWithApplication);

export default router;