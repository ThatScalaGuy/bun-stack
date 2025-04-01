import { transporter } from "../../mailer";
/**
 * Service for handling email communication
 * Manages all email sending for user authentication workflows
 */
export const EmailService = {
    /**
     * Send a verification email to a new user
     * @param email Recipient email address
     * @param token Verification token
     * @param displayName User's display name
     */
    sendVerificationEmail: (mail: typeof transporter.sendMail) => async (email: string, token: string, displayName: string): Promise<void> => {
        // Log for development purposes
        console.log(`Sending verification email to ${email} with token ${token}`);

        const verificationUrl = `${Bun.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
        console.log(`Verification URL: ${verificationUrl}`);

        // Send actual email using Nodemailer
        await mail({
            from: Bun.env.SMTP_FROM,
            to: email,
            subject: "Verify your email address",
            text: `Hello ${displayName},\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nIf you did not create an account, please ignore this email.\n\nThank you.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <p>Hello ${displayName},</p>
                    <p>Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
                    </div>
                    <p>Or copy and paste this link in your browser: <a href="${verificationUrl}">${verificationUrl}</a></p>
                    <p>If you did not create an account, please ignore this email.</p>
                    <p>Thank you.</p>
                </div>
            `
        });
    },

    /**
     * Send a password reset email
     * @param email Recipient email address
     * @param token Password reset token
     */
    sendPasswordResetEmail: (mail: typeof transporter.sendMail) => async (email: string, token: string): Promise<void> => {
        // Log for development purposes
        console.log(`Sending password reset email to ${email} with token ${token}`);

        const resetUrl = `${Bun.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        console.log(`Password reset URL: ${resetUrl}`);

        // Send actual email using Nodemailer
        await mail({
            from: Bun.env.SMTP_FROM,
            to: email,
            subject: "Reset Your Password",
            text: `Hello,\n\nYou requested a password reset. Click the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.\n\nThank you.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested a password reset. Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link in your browser: <a href="${resetUrl}">${resetUrl}</a></p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <p>Thank you.</p>
                </div>
            `
        });
    },

    /**
     * Send a notification about account lockout due to failed login attempts
     * @param email Recipient email address
     * @param lockoutMinutes Duration of the lockout in minutes
     */
    sendAccountLockoutNotification: (mail: typeof transporter.sendMail) => async (email: string, lockoutMinutes: number): Promise<void> => {
        console.log(`Sending account lockout notification to ${email}. Account locked for ${lockoutMinutes} minutes.`);

        // Send actual email using Nodemailer
        await mail({
            from: Bun.env.SMTP_FROM,
            to: email,
            subject: "Account Temporarily Locked",
            text: `Hello,\n\nYour account has been temporarily locked due to multiple failed login attempts. It will be automatically unlocked after ${lockoutMinutes} minutes.\n\nIf you did not attempt to log in, please consider changing your password once you regain access to your account.\n\nThank you.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Account Temporarily Locked</h2>
                    <p>Hello,</p>
                    <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
                    <p>It will be automatically unlocked after <strong>${lockoutMinutes} minutes</strong>.</p>
                    <p>If you did not attempt to log in, please consider changing your password once you regain access to your account.</p>
                    <p>Thank you.</p>
                </div>
            `
        });
    },

    /**
     * Send a notification about suspicious login activity
     * @param email Recipient email address
     * @param ipAddress IP address of the login attempt
     * @param date Date and time of the attempt
     */
    sendSuspiciousActivityAlert: (mail: typeof transporter.sendMail) => async (email: string, ipAddress: string, date: Date): Promise<void> => {
        console.log(`Sending suspicious activity alert to ${email} for login attempt from ${ipAddress} at ${date}`);

        const formattedDate = date.toLocaleString();

        // Send actual email using Nodemailer
        await mail({
            from: Bun.env.SMTP_FROM,
            to: email,
            subject: "Suspicious Activity Detected on Your Account",
            text: `Hello,\n\nWe detected a suspicious login attempt to your account from:\n\nIP Address: ${ipAddress}\nTime: ${formattedDate}\n\nIf this was not you, please change your password immediately and consider enabling two-factor authentication if available.\n\nThank you.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Suspicious Activity Alert</h2>
                    <p>Hello,</p>
                    <p>We detected a suspicious login attempt to your account from:</p>
                    <div style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
                        <p><strong>IP Address:</strong> ${ipAddress}</p>
                        <p><strong>Time:</strong> ${formattedDate}</p>
                    </div>
                    <p>If this was not you, please change your password immediately and consider enabling two-factor authentication if available.</p>
                    <p>Thank you.</p>
                </div>
            `
        });
    },
};
