import express from "express";
import { parseJobDescription } from "../controller/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/parse-jd", protect, parseJobDescription);

export default router;
