import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { publicATSCheck } from "../controller/atsController.js";

const router = express.Router();

router.post(
    "/check",
    upload.single("resume"),
    publicATSCheck
);

export default router;
