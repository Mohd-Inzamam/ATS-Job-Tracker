import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

        const user = await User.create({ name, email, password });

        const token = generateVerificationToken();

        user.verificationToken = token;
        user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24h
        await user.save();
        console.log("User registered:", user);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (user && (await user.matchPassword(password))) {
            console.log("User logged in:", user);
            res.status(200).json({
                user: {  // ✅ Wrap user data
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                token: generateToken(user._id),
                refreshToken: generateRefreshToken(user._id)
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

    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
};

export const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    res.status(200).json({
        message: "Reset token generated",
        resetToken // later send via email
    });
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
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