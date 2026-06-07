import User from "../models/User.js";

export const createDemoCheckout = async (req, res) => {
    try {
        if (req.user.plan === "pro") {
            return res.status(400).json({ message: "You are already on Pro" });
        }

        res.json({
            demo: true,
            sessionId: "demo_" + Date.now(),
            plan: "pro",
            amount: 12,
            currency: "USD",
            checkoutUrl: null
        });
    } catch (error) {
        console.error("Error creating demo checkout:", error);
        res.status(500).json({ message: "Failed to create checkout session" });
    }
};

export const activateDemoPro = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.plan = "pro";
        user.planActivatedAt = new Date();
        user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.stripeCustomerId = "demo_customer_" + user._id;
        user.stripeSubscriptionId = "demo_sub_" + Date.now();

        await user.save();

        res.status(200).json({
            plan: user.plan,
            planActivatedAt: user.planActivatedAt,
            planExpiresAt: user.planExpiresAt
        });
    } catch (error) {
        console.error("Error activating demo pro:", error);
        res.status(500).json({ message: "Failed to activate Pro plan" });
    }
};

export const cancelDemoPro = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.plan = "free";
        user.planExpiresAt = null;
        user.stripeSubscriptionId = null;

        await user.save();

        res.status(200).json({
            plan: "free",
            message: "Subscription cancelled"
        });
    } catch (error) {
        console.error("Error cancelling demo pro:", error);
        res.status(500).json({ message: "Failed to cancel plan" });
    }
};

export const getBillingStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            plan: user.plan,
            planActivatedAt: user.planActivatedAt,
            planExpiresAt: user.planExpiresAt,
            stripeSubscriptionId: user.stripeSubscriptionId,
            isDemo: user.stripeSubscriptionId?.startsWith("demo_") || false
        });
    } catch (error) {
        console.error("Error fetching billing status:", error);
        res.status(500).json({ message: "Failed to fetch billing status" });
    }
};
