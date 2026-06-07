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
    markOnboardingComplete,
    resendVerificationEmail,
    changePassword,
    deleteAccount
} from "../controller/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/resend-verification", resendVerificationEmail);
router.post("/login", loginUser);
router.get("/getProfile", protect, getUserProfile);
router.put("/updateProfile", protect, updateUserProfile);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/refresh", refreshAccessToken);
router.patch("/onboarding-complete", protect, markOnboardingComplete);
router.patch("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

export default router;
