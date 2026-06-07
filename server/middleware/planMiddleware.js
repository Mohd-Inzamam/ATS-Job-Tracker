import Resume from "../models/Resume.js";
import JobApplication from "../models/JobApplication.js";
import { PLAN_LIMITS } from "../config/planLimits.js";

const getPlan = (user) => user?.plan || "free";

export const checkResumeLimit = async (req, res, next) => {
    try {
        const plan = getPlan(req.user);
        const limit = PLAN_LIMITS[plan].resumes;

        const count = await Resume.countDocuments({
            user: req.user._id,
            isDeleted: false
        });

        if (count >= limit) {
            return res.status(403).json({
                limitReached: true,
                feature: "resumes",
                limit,
                current: count,
                message: "Free plan allows 1 resume. Upgrade to Pro for unlimited resumes.",
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const checkApplicationLimit = async (req, res, next) => {
    try {
        const plan = getPlan(req.user);
        const limit = PLAN_LIMITS[plan].applications;

        const count = await JobApplication.countDocuments({
            user: req.user._id
        });

        if (count >= limit) {
            return res.status(403).json({
                limitReached: true,
                feature: "applications",
                limit,
                current: count,
                message: "Free plan allows 5 applications. Upgrade to Pro for unlimited tracking.",
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const checkAIAccess = async (req, res, next) => {
    try {
        const plan = getPlan(req.user);

        if (PLAN_LIMITS[plan].aiFeatures === false) {
            return res.status(403).json({
                limitReached: true,
                feature: "aiFeatures",
                limit: false,
                current: 0,
                message: "AI features are available on the Pro plan. Upgrade to unlock.",
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const checkAnalyticsAccess = async (req, res, next) => {
    try {
        const plan = getPlan(req.user);

        if (PLAN_LIMITS[plan].analyticsAccess === false) {
            return res.status(403).json({
                limitReached: true,
                feature: "analyticsAccess",
                limit: false,
                current: 0,
                message: "Analytics dashboard is a Pro feature. Upgrade to unlock.",
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const checkMatchAccess = async (req, res, next) => {
    try {
        const plan = getPlan(req.user);

        if (PLAN_LIMITS[plan].matchAccess === false) {
            return res.status(403).json({
                limitReached: true,
                feature: "matchAccess",
                limit: false,
                current: 0,
                message: "Resume–JD matching is a Pro feature. Upgrade to unlock.",
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
