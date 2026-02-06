import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
} from "../controller/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getProfile", protect, getUserProfile);
router.put("/updateProfile", protect, updateUserProfile);

export default router;
