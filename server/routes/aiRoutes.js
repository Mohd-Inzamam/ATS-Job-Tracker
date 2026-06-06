import express from "express";
import { parseJobDescription, explainMatch } from "../controller/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/parse-jd", protect, parseJobDescription);
router.post("/explain-match", protect, explainMatch);

export default router;
