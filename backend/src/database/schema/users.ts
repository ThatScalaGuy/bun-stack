import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * Users table for storing core user information
 * Follows security best practices with separate password hash and salt storage
 */
export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    email: text("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    isEmailVerified: integer("is_email_verified", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: integer("locked_until", { mode: "timestamp" }),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
});

/**
 * User profiles table for storing additional user information
 * Separated from the users table to keep the users table lean
 */
export const userProfiles = sqliteTable("user_profiles", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    preferences: text("preferences", { mode: "json" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId] }),
}));

/**
 * MFA table for storing multi-factor authentication settings
 */
export const userMfa = sqliteTable("user_mfa", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // totp, sms, etc.
    secret: text("secret").notNull(),
    isVerified: integer("is_verified", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * User roles table for role-based access control
 */
export const roles = sqliteTable("roles", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * User-role many-to-many relationship
 */
export const userRoles = sqliteTable("user_roles", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: integer("assigned_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));

/**
 * Sessions table for JWT token management
 */
export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    isRevoked: integer("is_revoked", { mode: "boolean" }).default(false).notNull(),
});

/**
 * Password reset tokens table
 */
export const passwordResetTokens = sqliteTable("password_reset_tokens", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    isUsed: integer("is_used", { mode: "boolean" }).default(false).notNull(),
});

/**
 * Email verification tokens table
 */
export const emailVerificationTokens = sqliteTable("email_verification_tokens", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    isUsed: integer("is_used", { mode: "boolean" }).default(false).notNull(),
});

/**
 * Audit logs table for security events
 */
export const auditLogs = sqliteTable("audit_logs", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    detail: text("detail", { mode: "json" }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * Rate limiting table for tracking login attempts
 */
export const rateLimits = sqliteTable("rate_limits", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    ipAddress: text("ip_address").notNull(),
    endpoint: text("endpoint").notNull(),
    attempts: integer("attempts").default(1).notNull(),
    blockedUntil: integer("blocked_until", { mode: "timestamp" }),
    lastAttemptAt: integer("last_attempt_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
