import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendMail.js";
import { sendPasswordResetEmail } from "../utils/sendMail.js";


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
    });
};

const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d"
    });
};

export const refreshAccessToken = async (req, res) => {
    const refreshHeader = req.headers["x-refresh-token"];

    if (!refreshHeader) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    const refreshToken = refreshHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const newAccessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.status(200).json({ token: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            isVerified: false
        });

        const rawToken = generateVerificationToken();

        const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        user.verificationToken = hashedToken;
        user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        // send email
        try {
            await sendVerificationEmail(user.email, rawToken);
            console.log("Verification email sent to:", user.email);
        } catch (emailError) {
            console.error("Error sending verification email:", emailError);
        }
        res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email."
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: "Please verify your email before logging in" });
            }

            const refreshToken = generateRefreshToken(user._id);

            const hashedRefreshToken = crypto
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");

            user.refreshToken = hashedRefreshToken;
            await user.save();
            console.log("User logged in:", user);
            res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                token: generateToken(user._id),
                refreshToken
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpire: { $gt: Date.now() }
    }).select("+verificationToken +verificationTokenExpire");
    console.log("Email verification attempt:", { token, user });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
};

export const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const rawResetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
        .createHash("sha256")
        .update(rawResetToken)
        .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${rawResetToken}`;

    try {
        await sendPasswordResetEmail(user.email, rawResetToken);
    } catch (emailError) {
        console.error("Error sending reset email:", emailError);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.status(200).json({
        message: "Reset token generated",
    });
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password; // pre-save hook hashes it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
};