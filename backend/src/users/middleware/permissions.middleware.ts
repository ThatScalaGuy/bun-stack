import { Elysia } from "elysia";
import { hasPermission, PERMISSIONS } from "../utils/rbac";
import { ForbiddenError } from "../../utils/error-handlers";
import { authMiddleware } from "./auth.middleware";

/**
 * Permission middleware for fine-grained access control
 * Extends the authentication middleware with permission checks
 */
export const permissionsMiddleware = new Elysia({ name: "permissions" })
    .use(authMiddleware)
    .derive(({ userRoles }) => ({
        /**
         * Check if the current user has a specific permission
         * @param permission Permission to check for
         * @returns Boolean indicating if the user has the permission
         */
        hasPermission: (permission: string): boolean => {
            return hasPermission(userRoles || [], permission);
        },

        /**
         * Require a specific permission to access a route
         * Throws an error if the user doesn't have the required permission
         * @param permission Permission required for access
         */
        requirePermission: (permission: string): void => {
            if (!hasPermission(userRoles || [], permission)) {
                throw new ForbiddenError(`Missing required permission: ${permission}`);
            }
        },

        /**
         * Require user management permissions
         */
        requireUserManagement: (): void => {
            if (!hasPermission(userRoles || [], PERMISSIONS.ADMIN_MANAGE_USERS)) {
                throw new ForbiddenError("User management requires admin privileges");
            }
        },

        /**
         * Require administrator access
         */
        requireAdmin: (): void => {
            if (!hasPermission(userRoles || [], PERMISSIONS.ADMIN_ACCESS)) {
                throw new ForbiddenError("Administrator access required");
            }
        },

        /**
         * Check if the user is an administrator
         * @returns Boolean indicating if user has admin role
         */
        isAdmin: (): boolean => {
            return (userRoles || []).includes('admin');
        },

        /**
         * Check if the user is a moderator
         * @returns Boolean indicating if user has moderator role
         */
        isModerator: (): boolean => {
            return (userRoles || []).includes('moderator');
        }
    }))
    .as('plugin');
