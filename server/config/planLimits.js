export const PLAN_LIMITS = {
    free: {
        resumes: 1,
        applications: 5,
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
