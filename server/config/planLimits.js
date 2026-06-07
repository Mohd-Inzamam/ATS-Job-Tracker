export const PLAN_LIMITS = {
    free: {
        resumes: 2,
        applications: 10,
        aiFeatures: false,
        analyticsAccess: false,
        matchAccess: false
    },
    pro: {
        resumes: Infinity,
        applications: Infinity,
        aiFeatures: true,
        analyticsAccess: true,
        matchAccess: true
    }
};