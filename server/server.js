import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/config.js";
import authRoutes from "./routes/authRoutes.js"
import resumeRoutes from "./routes/resumeRoutes.js"
import atsRoutes from "./routes/atsRoutes.js"
import applicationRoutes from "./routes/jobApplicationRoutes.js"
import matchRoutes from "./routes/matchRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"

dotenv.config();        // Load env variables
connectDB();            // Connect to MongoDB

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
    credentials: true
}));
// app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/auth", authRoutes)
app.use("/api/resumes", resumeRoutes)
app.use("/api/ats", atsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("🚀 Server is running...");
});

// PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
