import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/config.js";
import authRoutes from "./routes/authRoutes.js"
import resumeRoutes from "./routes/resumeRoutes.js"
import atsRoutes from "./routes/atsRoutes.js"
import applicationRoutes from "./routes/jobApplicationRoutes.js"

dotenv.config();        // Load env variables
connectDB();            // Connect to MongoDB

const app = express();

// CORS Middleware
// Allow requests from any origin (for development)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, x-refresh-token"
    );
    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/auth", authRoutes)
app.use("/api/resumes", resumeRoutes)
app.use("/api/ats", atsRoutes);
app.use("/api/applications", applicationRoutes);

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
