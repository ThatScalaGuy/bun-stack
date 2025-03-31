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
    sendVerificationEmail: async (email: string, token: string, displayName: string): Promise<void> => {
        // In a real implementation, this would use an email provider API
        console.log(`Sending verification email to ${email} with token ${token}`);

        // For development purposes - log the verification URL
        const verificationUrl = `${Bun.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
        console.log(`Verification URL: ${verificationUrl}`);

        // TODO: Implement actual email sending with your preferred provider
        // e.g., Resend, SendGrid, AWS SES, etc.
    },

    /**
     * Send a password reset email
     * @param email Recipient email address
     * @param token Password reset token
     */
    sendPasswordResetEmail: async (email: string, token: string): Promise<void> => {
        // In a real implementation, this would use an email provider API
        console.log(`Sending password reset email to ${email} with token ${token}`);

        // For development purposes - log the reset URL
        const resetUrl = `${Bun.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        console.log(`Password reset URL: ${resetUrl}`);

        // TODO: Implement actual email sending with your preferred provider
    },

    /**
     * Send a notification about account lockout due to failed login attempts
     * @param email Recipient email address
     * @param lockoutMinutes Duration of the lockout in minutes
     */
    sendAccountLockoutNotification: async (email: string, lockoutMinutes: number): Promise<void> => {
        console.log(`Sending account lockout notification to ${email}. Account locked for ${lockoutMinutes} minutes.`);

        // TODO: Implement actual email sending with your preferred provider
    },

    /**
     * Send a notification about suspicious login activity
     * @param email Recipient email address
     * @param ipAddress IP address of the login attempt
     * @param date Date and time of the attempt
     */
    sendSuspiciousActivityAlert: async (email: string, ipAddress: string, date: Date): Promise<void> => {
        console.log(`Sending suspicious activity alert to ${email} for login attempt from ${ipAddress} at ${date}`);

        // TODO: Implement actual email sending with your preferred provider
    },
};
