import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Import user schema tables
import {
    users,
    userProfiles,
    userMfa,
    roles,
    userRoles,
    sessions,
    passwordResetTokens,
    emailVerificationTokens,
    auditLogs,
    rateLimits
} from "./schema/users";


export const tables = {
    users,
    userProfiles,
    userMfa,
    roles,
    userRoles,
    sessions,
    passwordResetTokens,
    emailVerificationTokens,
    auditLogs,
    rateLimits
} as const

export type Tables = typeof tables

// Export all tables
export {
    users,
    userProfiles,
    userMfa,
    roles,
    userRoles,
    sessions,
    passwordResetTokens,
    emailVerificationTokens,
    auditLogs,
    rateLimits
};