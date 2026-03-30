import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: process.env.BREVO_SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});

export const sendVerificationEmail = async (email, token) => {
    const verificationURL = `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;

    try {
        await transporter.sendMail({
            from: `"ATS Resume Analyzer" <${process.env.BREVO_SMTP_FROM}>`,
            to: email,
            subject: "Verify Your Email",
            html: `
        <h2>Welcome to ATS Resume Analyzer 🚀</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationURL}" style="color:blue;">
            Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
        `,
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending verification email to ${email}:`, error);
        throw new Error("Failed to send verification email");
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
        from: `"ATS Resume Analyzer" <${process.env.BREVO_SMTP_FROM}>`,
        to: email,
        subject: "Reset Your Password",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetURL}" style="color:blue;">Reset Password</a>
          <p>This link expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, ignore this email.</p>
        `,
    });
};