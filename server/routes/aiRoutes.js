import express from "express";
import {
    parseJobDescription,
    explainMatch,
    dashboardInsight
} from "../controller/aiController.js";
import protect from "../middleware/authMiddleware.js";
import { checkAIAccess } from "../middleware/planMiddleware.js";

const router = express.Router();

router.post("/parse-jd", protect, parseJobDescription);
router.post("/explain-match", protect, checkAIAccess, explainMatch);
router.post("/dashboard-insight", protect, checkAIAccess, dashboardInsight);

export default router;
