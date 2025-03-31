import { connection as db } from "../../database";
import {
    sessions,
    passwordResetTokens,
    emailVerificationTokens,
    userMfa,
    rateLimits,
    auditLogs
} from "../../database/schema";
import { eq, and, lt, gt } from "drizzle-orm";
import { PasswordService } from "../services/password.service";

/**
 * Repository for authentication-related data operations
 * Handles database interactions for auth-related entities
 */
export const AuthRepository = {
    /**
     * Create a session for a user
     * @param userId User ID
     * @param token JWT token
     * @param expiresAt Expiration timestamp
     * @param ipAddress Client IP address
     * @param userAgent Client user agent
     * @returns Created session or undefined
     */
    createSession: async (
        userId: string,
        token: string,
        expiresAt: Date,
        ipAddress?: string,
        userAgent?: string
    ) => {
        const result = await db.insert(sessions).values({
            userId,
            token,
            expiresAt,
            ipAddress,
            userAgent
        }).returning();

        return result[0];
    },

    /**
     * Find a session by token
     * @param token Session token
     * @returns Session or undefined if not found
     */
    findSessionByToken: async (token: string) => {
        const results = await db
            .select()
            .from(sessions)
            .where(
                and(
                    eq(sessions.token, token),
                    eq(sessions.isRevoked, false),
                    gt(sessions.expiresAt, new Date())
                )
            )
            .limit(1);

        return results[0];
    },

    /**
     * Revoke a session
     * @param id Session ID
     * @returns Whether the session was revoked
     */
    revokeSession: async (id: string) => {
        const result = await db.update(sessions)
            .set({ isRevoked: true })
            .where(eq(sessions.id, id))
            .returning({ id: sessions.id });

        return result.length > 0;
    },

    /**
     * Revoke all user sessions
     * @param userId User ID
     * @returns Number of revoked sessions
     */
    revokeAllUserSessions: async (userId: string) => {
        const result = await db.update(sessions)
            .set({ isRevoked: true })
            .where(
                and(
                    eq(sessions.userId, userId),
                    eq(sessions.isRevoked, false),
                    gt(sessions.expiresAt, new Date())
                )
            )
            .returning({ id: sessions.id });

        return result.length;
    },

    /**
     * Create a password reset token
     * @param userId User ID
     * @returns Created token
     */
    createPasswordResetToken: async (userId: string) => {
        // Generate secure token
        const token = PasswordService.generateSecureToken();

        // Token expires in 1 hour
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Invalidate any previous tokens for this user
        await db.update(passwordResetTokens)
            .set({ isUsed: true })
            .where(eq(passwordResetTokens.userId, userId));

        // Create new token
        const result = await db.insert(passwordResetTokens).values({
            userId,
            token,
            expiresAt
        }).returning();

        return result[0];
    },

    /**
     * Validate a password reset token
     * @param token Token to validate
     * @returns Token object if valid, undefined otherwise
     */
    validatePasswordResetToken: async (token: string) => {
        const results = await db
            .select()
            .from(passwordResetTokens)
            .where(
                and(
                    eq(passwordResetTokens.token, token),
                    eq(passwordResetTokens.isUsed, false),
                    gt(passwordResetTokens.expiresAt, new Date())
                )
            )
            .limit(1);

        return results[0];
    },

    /**
     * Mark a password reset token as used
     * @param id Token ID
     * @returns Whether the update was successful
     */
    markPasswordResetTokenAsUsed: async (id: string) => {
        const result = await db.update(passwordResetTokens)
            .set({ isUsed: true })
            .where(eq(passwordResetTokens.id, id))
            .returning({ id: passwordResetTokens.id });

        return result.length > 0;
    },

    /**
     * Create an email verification token
     * @param userId User ID
     * @returns Created token
     */
    createEmailVerificationToken: async (userId: string) => {
        // Generate secure token
        const token = PasswordService.generateSecureToken();

        // Token expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Invalidate any previous tokens for this user
        await db.update(emailVerificationTokens)
            .set({ isUsed: true })
            .where(eq(emailVerificationTokens.userId, userId));

        // Create new token
        const result = await db.insert(emailVerificationTokens).values({
            userId,
            token,
            expiresAt
        }).returning();

        return result[0];
    },

    /**
     * Validate an email verification token
     * @param token Token to validate
     * @returns Token object if valid, undefined otherwise
     */
    validateEmailVerificationToken: async (token: string) => {
        const results = await db
            .select()
            .from(emailVerificationTokens)
            .where(
                and(
                    eq(emailVerificationTokens.token, token),
                    eq(emailVerificationTokens.isUsed, false),
                    gt(emailVerificationTokens.expiresAt, new Date())
                )
            )
            .limit(1);

        return results[0];
    },

    /**
     * Mark an email verification token as used
     * @param id Token ID
     * @returns Whether the update was successful
     */
    markEmailVerificationTokenAsUsed: async (id: string) => {
        const result = await db.update(emailVerificationTokens)
            .set({ isUsed: true })
            .where(eq(emailVerificationTokens.id, id))
            .returning({ id: emailVerificationTokens.id });

        return result.length > 0;
    },

    /**
     * Create an MFA setup record
     * @param userId User ID
     * @param type MFA type (totp, sms)
     * @param secret Generated secret
     * @returns Created MFA record
     */
    createMfa: async (userId: string, type: string, secret: string) => {
        const result = await db.insert(userMfa).values({
            userId,
            type,
            secret,
            isVerified: false
        }).returning();

        return result[0];
    },

    /**
     * Find MFA settings for a user
     * @param userId User ID
     * @param type Optional MFA type filter
     * @returns MFA settings or undefined
     */
    findMfaByUserId: async (userId: string, type?: string) => {

        const filter = [eq(userMfa.userId, userId), eq(userMfa.isVerified, true)]
        if (type) {
            filter.push(eq(userMfa.type, type))
        }

        let query = db
            .select()
            .from(userMfa)
            .where(and(...filter));

        // Get the first result
        const results = await query.limit(1);

        return results[0];
    },

    /**
     * Find MFA setting by ID
     * @param id MFA record ID
     * @returns MFA setting or undefined
     */
    findMfaById: async (id: string) => {
        const results = await db
            .select()
            .from(userMfa)
            .where(eq(userMfa.id, id))
            .limit(1);

        return results[0];
    },

    /**
     * Mark MFA as verified
     * @param id MFA record ID
     * @returns Whether the update was successful
     */
    markMfaAsVerified: async (id: string) => {
        const result = await db.update(userMfa)
            .set({
                isVerified: true,
                updatedAt: new Date()
            })
            .where(eq(userMfa.id, id))
            .returning({ id: userMfa.id });

        return result.length > 0;
    },

    /**
     * Delete MFA settings
     * @param id MFA record ID
     * @returns Whether the deletion was successful
     */
    deleteMfa: async (id: string) => {
        const result = await db.delete(userMfa)
            .where(eq(userMfa.id, id))
            .returning({ id: userMfa.id });

        return result.length > 0;
    },

    /**
     * Record a rate limit attempt
     * @param ipAddress IP address
     * @param endpoint API endpoint
     * @returns Updated attempts count
     */
    recordRateLimitAttempt: async (ipAddress: string, endpoint: string) => {
        // Find existing record
        const existing = await db
            .select()
            .from(rateLimits)
            .where(
                and(
                    eq(rateLimits.ipAddress, ipAddress),
                    eq(rateLimits.endpoint, endpoint)
                )
            )
            .limit(1);

        if (existing[0]) {
            // Update existing record
            const result = await db.update(rateLimits)
                .set({
                    attempts: existing[0].attempts + 1,
                    lastAttemptAt: new Date()
                })
                .where(eq(rateLimits.id, existing[0].id))
                .returning();

            return result[0];
        } else {
            // Create new record
            const result = await db.insert(rateLimits).values({
                ipAddress,
                endpoint,
                attempts: 1,
                lastAttemptAt: new Date()
            }).returning();

            return result[0];
        }
    },

    /**
     * Check if IP is currently rate limited
     * @param ipAddress IP address
     * @param endpoint API endpoint
     * @param maxAttempts Maximum allowed attempts
     * @param windowMinutes Time window in minutes
     * @returns Whether the IP is rate limited
     */
    isRateLimited: async (
        ipAddress: string,
        endpoint: string,
        maxAttempts: number = 5,
        windowMinutes: number = 15
    ): Promise<boolean> => {
        // Calculate window start time
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

        // Check for rate limit record
        const result = await db
            .select()
            .from(rateLimits)
            .where(
                and(
                    eq(rateLimits.ipAddress, ipAddress),
                    eq(rateLimits.endpoint, endpoint),
                    gt(rateLimits.lastAttemptAt, windowStart)
                )
            )
            .limit(1);

        // Check if blocked
        if (result[0]?.blockedUntil && result[0]?.blockedUntil > new Date()) {
            return true;
        }

        // Check if too many attempts
        if (result[0]?.attempts >= maxAttempts) {
            // Block for 30 minutes
            const blockedUntil = new Date();
            blockedUntil.setMinutes(blockedUntil.getMinutes() + 30);

            // Update record with block
            await db.update(rateLimits)
                .set({ blockedUntil })
                .where(eq(rateLimits.id, result[0].id));

            return true;
        }

        return false;
    },

    /**
     * Reset rate limit for an IP address
     * @param ipAddress IP address
     * @param endpoint API endpoint
     */
    resetRateLimit: async (ipAddress: string, endpoint: string) => {
        await db.update(rateLimits)
            .set({
                attempts: 0,
                blockedUntil: null
            })
            .where(
                and(
                    eq(rateLimits.ipAddress, ipAddress),
                    eq(rateLimits.endpoint, endpoint)
                )
            );
    },

    /**
     * Log an audit event
     * @param action Action performed
     * @param detail Additional details (will be JSON stringified)
     * @param userId Optional user ID
     * @param ipAddress Optional IP address
     * @param userAgent Optional user agent
     */
    logAuditEvent: async (
        action: string,
        detail: object,
        userId?: string,
        ipAddress?: string,
        userAgent?: string
    ) => {
        await db.insert(auditLogs).values({
            action,
            detail: JSON.stringify(detail),
            userId,
            ipAddress,
            userAgent
        });
    }
};
