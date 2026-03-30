import JobApplication from "../models/JobApplication.js";
import Resume from "../models/Resume.js";
import { calculateMatch } from "../utils/matchScorer.js";


// @desc    Get overall job search analytics for the user
// @route   GET /api/analytics/overview
// @access  Private
export const getOverview = async (req, res) => {
    try {
        const applications = await JobApplication.find({
            user: req.user._id
        });

        const total = applications.length;

        if (total === 0) {
            return res.status(200).json({
                totalApplications: 0,
                statusBreakdown: {},
                interviewConversionRate: 0,
                offerConversionRate: 0,
                message: "No applications found. Start tracking your job search!"
            });
        }

        // Count each status
        const statusBreakdown = {
            Saved: 0,
            Applied: 0,
            Interview: 0,
            Offer: 0,
            Rejected: 0
        };

        applications.forEach((app) => {
            if (statusBreakdown[app.status] !== undefined) {
                statusBreakdown[app.status]++;
            }
        });

        // Interview conversion = interviews / total applied
        const totalApplied =
            statusBreakdown.Applied +
            statusBreakdown.Interview +
            statusBreakdown.Offer +
            statusBreakdown.Rejected;

        const interviewConversionRate =
            totalApplied > 0
                ? Math.round((statusBreakdown.Interview / totalApplied) * 100)
                : 0;

        // Offer conversion = offers / total applied
        const offerConversionRate =
            totalApplied > 0
                ? Math.round((statusBreakdown.Offer / totalApplied) * 100)
                : 0;

        res.status(200).json({
            totalApplications: total,
            statusBreakdown,
            interviewConversionRate,
            offerConversionRate
        });
    } catch (error) {
        console.error("Error fetching overview analytics:", error);
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
};


// @desc    Get application trends over time (by week)
// @route   GET /api/analytics/trends
// @access  Private
export const getApplicationTrends = async (req, res) => {
    try {
        const applications = await JobApplication.find({
            user: req.user._id
        }).sort({ createdAt: 1 });

        if (applications.length === 0) {
            return res.status(200).json({ trends: [] });
        }

        // Group applications by week (YYYY-WW format)
        const weekMap = {};

        applications.forEach((app) => {
            const date = new Date(app.createdAt);

            // Get ISO week number
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const weekNumber = Math.ceil(
                ((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
            );

            const key = `${date.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;

            if (!weekMap[key]) {
                weekMap[key] = { week: key, count: 0, statuses: {} };
            }

            weekMap[key].count++;
            weekMap[key].statuses[app.status] =
                (weekMap[key].statuses[app.status] || 0) + 1;
        });

        const trends = Object.values(weekMap);

        res.status(200).json({ trends });
    } catch (error) {
        console.error("Error fetching trends:", error);
        res.status(500).json({ message: "Failed to fetch trends" });
    }
};


// @desc    Compare match scores across all resumes for a given JD
// @route   POST /api/analytics/resume-performance
// @access  Private
export const getResumePerformance = async (req, res) => {
    try {
        const { jobDescription } = req.body;

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            });
        }

        const resumes = await Resume.find({
            user: req.user._id,
            isDeleted: false
        });

        if (resumes.length === 0) {
            return res.status(200).json({
                message: "No resumes found. Upload resumes to compare performance.",
                results: []
            });
        }

        // Run match scoring for every resume against the provided JD
        const results = resumes.map((resume) => {
            const { matchPercentage, matchedKeywords, missingKeywords } =
                calculateMatch(resume.parsedText, jobDescription);

            return {
                resumeId: resume._id,
                label: resume.label,
                targetRole: resume.targetRole || "Not specified",
                matchPercentage,
                matchedCount: matchedKeywords.length,
                missingCount: missingKeywords.length,
                topMissingKeywords: missingKeywords.slice(0, 5)
            };
        });

        // Sort best match first
        results.sort((a, b) => b.matchPercentage - a.matchPercentage);

        res.status(200).json({ results });
    } catch (error) {
        console.error("Error fetching resume performance:", error);
        res.status(500).json({ message: "Failed to fetch resume performance" });
    }
};


// @desc    Get application success rate per company or role
// @route   GET /api/analytics/success-rate
// @access  Private
export const getSuccessRate = async (req, res) => {
    try {
        const applications = await JobApplication.find({
            user: req.user._id
        });

        if (applications.length === 0) {
            return res.status(200).json({ byRole: [], byCompany: [] });
        }

        // Group by job title
        const roleMap = {};
        const companyMap = {};

        applications.forEach((app) => {
            // By role
            if (!roleMap[app.jobTitle]) {
                roleMap[app.jobTitle] = { total: 0, interviews: 0, offers: 0 };
            }
            roleMap[app.jobTitle].total++;
            if (app.status === "Interview") roleMap[app.jobTitle].interviews++;
            if (app.status === "Offer") roleMap[app.jobTitle].offers++;

            // By company
            if (!companyMap[app.companyName]) {
                companyMap[app.companyName] = { total: 0, interviews: 0, offers: 0 };
            }
            companyMap[app.companyName].total++;
            if (app.status === "Interview") companyMap[app.companyName].interviews++;
            if (app.status === "Offer") companyMap[app.companyName].offers++;
        });

        // Format role stats
        const byRole = Object.entries(roleMap).map(([role, data]) => ({
            role,
            total: data.total,
            interviews: data.interviews,
            offers: data.offers,
            interviewRate:
                Math.round((data.interviews / data.total) * 100)
        }));

        // Format company stats
        const byCompany = Object.entries(companyMap).map(([company, data]) => ({
            company,
            total: data.total,
            interviews: data.interviews,
            offers: data.offers,
            interviewRate:
                Math.round((data.interviews / data.total) * 100)
        }));

        res.status(200).json({ byRole, byCompany });
    } catch (error) {
        console.error("Error fetching success rate:", error);
        res.status(500).json({ message: "Failed to fetch success rate" });
    }
};