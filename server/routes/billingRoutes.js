import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    createDemoCheckout,
    activateDemoPro,
    cancelDemoPro,
    getBillingStatus
} from "../controller/billingController.js";

const router = express.Router();

router.post("/checkout", protect, createDemoCheckout);
router.post("/activate-demo", protect, activateDemoPro);
router.post("/cancel", protect, cancelDemoPro);
router.get("/status", protect, getBillingStatus);

export default router;
