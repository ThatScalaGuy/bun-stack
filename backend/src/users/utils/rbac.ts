/**
 * Role-Based Access Control utility
 * Defines permissions for different roles in the system
 */

// Define all permissions in the system
export const PERMISSIONS = {
    // User permissions
    USER_VIEW: "user:view",
    USER_CREATE: "user:create",
    USER_UPDATE: "user:update",
    USER_DELETE: "user:delete",

    // Content permissions
    CONTENT_CREATE: "content:create",
    CONTENT_VIEW: "content:view",
    CONTENT_UPDATE: "content:update",
    CONTENT_DELETE: "content:delete",
    CONTENT_APPROVE: "content:approve",

    // Admin permissions
    ADMIN_ACCESS: "admin:access",
    ADMIN_MANAGE_USERS: "admin:manage:users",
    ADMIN_MANAGE_ROLES: "admin:manage:roles",
    ADMIN_VIEW_LOGS: "admin:view:logs"
};

// Define role-permission mappings
export const ROLE_PERMISSIONS = {
    admin: [
        ...Object.values(PERMISSIONS)
    ],
    moderator: [
        PERMISSIONS.USER_VIEW,
        PERMISSIONS.CONTENT_CREATE,
        PERMISSIONS.CONTENT_VIEW,
        PERMISSIONS.CONTENT_UPDATE,
        PERMISSIONS.CONTENT_APPROVE
    ],
    user: [
        PERMISSIONS.USER_VIEW,
        PERMISSIONS.CONTENT_CREATE,
        PERMISSIONS.CONTENT_VIEW,
        PERMISSIONS.CONTENT_UPDATE
    ]
};

/**
 * Check if a user has a specific permission based on their roles
 * @param userRoles Array of role names the user has
 * @param requiredPermission Permission to check for
 * @returns Boolean indicating if the user has the permission
 */
export const hasPermission = (
    userRoles: string[],
    requiredPermission: string
): boolean => {
    // Check each user role
    for (const role of userRoles) {
        const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
        if (permissions?.includes(requiredPermission)) {
            return true;
        }
    }

    return false;
};

/**
 * Get all permissions for a specific role
 * @param role Role name
 * @returns Array of permissions or empty array if role doesn't exist
 */
export const getPermissionsForRole = (role: string): string[] => {
    return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
};
