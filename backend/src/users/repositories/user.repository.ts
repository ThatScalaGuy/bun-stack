import { connection as db } from "../../database";
import { users, userProfiles, userRoles, roles } from "../../database/schema";
import { eq, sql } from "drizzle-orm";
import type { RegisterUserInput, UpdateProfileInput } from "../types";
import { PasswordService } from "../services/password.service";

/**
 * Repository for user data operations
 * Handles database interactions for user entities
 */
export const UserRepository = {
    /**
     * Find a user by their email
     * @param email User email to search for
     * @returns User object or undefined if not found
     */
    findByEmail: async (email: string) => {
        const results = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        return results[0];
    },

    /**
     * Find a user by their ID
     * @param id User ID to search for
     * @returns User object or undefined if not found
     */
    findById: async (id: string) => {
        const results = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return results[0];
    },

    /**
     * Create a new user
     * @param userData User data for registration
     * @returns Created user object
     */
    create: async (userData: RegisterUserInput) => {
        // Hash the password
        const passwordHash = await PasswordService.hashPassword(userData.password);

        // Insert the user
        const result = await db.insert(users).values({
            email: userData.email.toLowerCase(),
            displayName: userData.displayName,
            passwordHash,
        }).returning();

        // Create default profile
        if (result[0]) {
            await db.insert(userProfiles).values({
                userId: result[0].id,
            });
        }

        return result[0];
    },

    /**
     * Update a user's profile
     * @param userId User ID
     * @param profileData Profile data to update
     * @returns Updated profile or undefined
     */
    updateProfile: async (userId: string, profileData: UpdateProfileInput) => {
        // Update user display name if provided
        if (profileData.displayName) {
            await db.update(users)
                .set({ displayName: profileData.displayName, updatedAt: new Date() })
                .where(eq(users.id, userId));
        }

        // Update profile data
        const result = await db.update(userProfiles)
            .set({
                bio: profileData.bio !== undefined ? profileData.bio : undefined,
                preferences: profileData.preferences !== undefined ? JSON.stringify(profileData.preferences) : undefined,
                updatedAt: new Date(),
            })
            .where(eq(userProfiles.userId, userId))
            .returning();

        return result[0];
    },

    /**
     * Update user's password
     * @param userId User ID
     * @param newPasswordHash New password hash
     * @returns Whether the update was successful
     */
    updatePassword: async (userId: string, newPasswordHash: string) => {
        const result = await db.update(users)
            .set({
                passwordHash: newPasswordHash,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning({ id: users.id });

        return result.length > 0;
    },

    /**
     * Get user roles
     * @param userId User ID
     * @returns Array of role names
     */
    getUserRoles: async (userId: string): Promise<string[]> => {
        const userRolesResult = await db
            .select({ name: roles.name })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, userId));

        return userRolesResult.map(r => r.name);
    },

    /**
     * Get user profile with basic user data
     * @param userId User ID
     * @returns User profile data
     */
    getProfileWithUserData: async (userId: string) => {
        const results = await db
            .select({
                id: users.id,
                email: users.email,
                displayName: users.displayName,
                isEmailVerified: users.isEmailVerified,
                createdAt: users.createdAt,
                bio: userProfiles.bio,
                avatarUrl: userProfiles.avatarUrl,
                preferences: userProfiles.preferences,
            })
            .from(users)
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(eq(users.id, userId))
            .limit(1);

        return results[0];
    },

    /**
     * Mark email as verified
     * @param userId User ID
     * @returns Whether the update was successful
     */
    markEmailAsVerified: async (userId: string) => {
        const result = await db.update(users)
            .set({
                isEmailVerified: true,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning({ id: users.id });

        return result.length > 0;
    },

    /**
     * Update login attempt counters
     * @param userId User ID
     * @param failed Whether the login attempt failed
     * @returns Updated user or undefined
     */
    updateLoginAttempts: async (userId: string, failed: boolean) => {
        if (failed) {
            // Increment failed login attempts
            const result = await db.update(users)
                .set({
                    failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId))
                .returning();

            return result[0];
        } else {
            // Reset failed login attempts and update last login
            const result = await db.update(users)
                .set({
                    failedLoginAttempts: 0,
                    lastLoginAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId))
                .returning();

            return result[0];
        }
    },

    /**
     * Lock a user account
     * @param userId User ID
     * @param lockUntil Date until account is locked
     * @returns Whether the lock was successful
     */
    lockAccount: async (userId: string, lockUntil: Date) => {
        const result = await db.update(users)
            .set({
                lockedUntil: lockUntil,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning({ id: users.id });

        return result.length > 0;
    },

    /**
     * Check if account is locked
     * @param userId User ID
     * @returns Whether the account is locked
     */
    isAccountLocked: async (userId: string): Promise<boolean> => {
        const result = await db
            .select({ lockedUntil: users.lockedUntil })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!result[0] || !result[0].lockedUntil) {
            return false;
        }

        return new Date(result[0].lockedUntil) > new Date();
    },

    /**
     * Set account active status
     * @param userId User ID
     * @param isActive Whether the account should be active
     * @returns Whether the update was successful
     */
    setActiveStatus: async (userId: string, isActive: boolean) => {
        const result = await db.update(users)
            .set({
                isActive: isActive,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning({ id: users.id });

        return result.length > 0;
    },
};
