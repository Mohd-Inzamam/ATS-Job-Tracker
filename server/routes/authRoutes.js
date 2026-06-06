import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    verifyEmail,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
    markOnboardingComplete
} from "../controller/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getProfile", protect, getUserProfile);
router.put("/updateProfile", protect, updateUserProfile);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh", refreshAccessToken);
router.patch("/onboarding-complete", protect, markOnboardingComplete);

export default router;
