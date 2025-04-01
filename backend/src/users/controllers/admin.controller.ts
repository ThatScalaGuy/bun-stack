import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { permissionsMiddleware } from "../middleware/permissions.middleware";
import { UserRepository } from "../repositories/user.repository";
import { RoleRepository } from "../repositories/role.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { PERMISSIONS } from "../utils/rbac";
import { connection as db } from "../../database";
import { users, roles, auditLogs } from "../../database/schema";
import { desc, eq, sql } from "drizzle-orm";

/**
 * Admin controller
 * Handles administrative functions like user management and role assignment
 */
export const adminController = new Elysia({ prefix: "/admin" })
    .use(authMiddleware)
    .use(permissionsMiddleware)

    /**
     * Get all users
     * GET /admin/users
     */
    .get("/users", async ({ requirePermission }) => {
        // Require admin permissions to manage users
        requirePermission(PERMISSIONS.ADMIN_MANAGE_USERS);

        // Get all users from database
        const usersList = await db.select({
            id: users.id,
            email: users.email,
            displayName: users.displayName,
            isEmailVerified: users.isEmailVerified,
            isActive: users.isActive,
            createdAt: users.createdAt
        })
            .from(users);

        return {
            users: usersList
        };
    })

    /**
     * Get user details by ID
     * GET /admin/users/:id
     */
    .get("/users/:userId", async ({ params, set, requirePermission }) => {
        // Require admin permissions to manage users
        requirePermission(PERMISSIONS.ADMIN_MANAGE_USERS);

        const user = await UserRepository.findById(params.userId);

        if (!user) {
            set.status = 404;
            return { success: false, error: "User not found" };
        }

        // Get user roles
        const userRoles = await RoleRepository.getUserRoles(params.userId);

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                isEmailVerified: user.isEmailVerified,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLoginAt: user.lastLoginAt,
                failedLoginAttempts: user.failedLoginAttempts,
                lockedUntil: user.lockedUntil,
                roles: userRoles.map(r => ({ id: r.id, name: r.name }))
            }
        };
    }, {
        params: t.Object({
            userId: t.String()
        })
    })

    /**
     * Set user active status
     * PUT /admin/users/:id/status
     */
    .put("/users/:userId/status", async ({ params, body, error, requirePermission }) => {
        // Require admin permissions to manage users
        requirePermission(PERMISSIONS.ADMIN_MANAGE_USERS);

        const user = await UserRepository.findById(params.userId);

        if (!user) {
            return error(404, "User not found");
        }

        const updated = await UserRepository.setActiveStatus(params.userId, body.isActive);

        if (!updated) {
            return error(400, "Failed to update user status");
        }

        // Log audit event
        await AuthRepository.logAuditEvent(
            "admin.set_user_status",
            { userId: params.userId, isActive: body.isActive }
        );

        return {
            success: true,
            message: `User ${body.isActive ? 'activated' : 'deactivated'} successfully`
        };
    }, {
        params: t.Object({
            userId: t.String()
        }),
        body: t.Object({
            isActive: t.Boolean()
        })
    })

    /**
     * Assign a role to a user
     * POST /admin/users/:userId/roles
     */
    .post("/users/:userId/roles", async ({ params, body, error, requirePermission }) => {
        // Require admin permissions to manage roles
        requirePermission(PERMISSIONS.ADMIN_MANAGE_ROLES);

        const user = await UserRepository.findById(params.userId);

        if (!user) {
            return error(404, "User not found");
        }

        // Find role by name or ID
        let role;
        if (body.roleId) {
            const rolesList = await db.select()
                .from(roles)
                .where(eq(roles.id, body.roleId))
                .limit(1);
            role = rolesList[0];
        } else if (body.roleName) {
            role = await RoleRepository.findRoleByName(body.roleName);
        }

        if (!role) {
            return error(404, "Role not found");
        }

        // Assign role to user
        const assigned = await RoleRepository.assignRoleToUser(params.userId, role.id);

        if (!assigned) {
            return error(400, "Failed to assign role or role already assigned");
        }

        // Log audit event
        await AuthRepository.logAuditEvent(
            "admin.assign_role",
            { userId: params.userId, roleId: role.id, roleName: role.name }
        );

        return {
            success: true,
            message: `Role '${role.name}' assigned successfully`
        };
    }, {
        params: t.Object({
            userId: t.String()
        }),
        body: t.Object({
            roleId: t.Optional(t.String()),
            roleName: t.Optional(t.String())
        })
    })

    /**
     * Remove a role from a user
     * DELETE /admin/users/:userId/roles/:roleId
     */
    .delete("/users/:userId/roles/:roleId", async ({ params, error, requirePermission }) => {
        // Require admin permissions to manage roles
        requirePermission(PERMISSIONS.ADMIN_MANAGE_ROLES);

        const user = await UserRepository.findById(params.userId);

        if (!user) {
            return error(404, "User not found");
        }

        // Check if role exists
        const roleResult = await db.select()
            .from(roles)
            .where(eq(roles.id, params.roleId))
            .limit(1);

        const role = roleResult[0];

        if (!role) {
            return error(404, "Role not found");
        }

        // Remove role from user
        const removed = await RoleRepository.removeRoleFromUser(params.userId, params.roleId);

        if (!removed) {
            return error(400, "Failed to remove role or user doesn't have this role");
        }

        // Log audit event
        await AuthRepository.logAuditEvent(
            "admin.remove_role",
            { userId: params.userId, roleId: params.roleId, roleName: role.name }
        );

        return {
            success: true,
            message: `Role '${role.name}' removed successfully`
        };
    }, {
        params: t.Object({
            userId: t.String(),
            roleId: t.String()
        })
    })

    /**
     * Get all audit logs
     * GET /admin/audit-logs
     */
    .get("/audit-logs", async ({ set, query, requirePermission }) => {
        // Require admin permissions to view logs
        requirePermission(PERMISSIONS.ADMIN_VIEW_LOGS);

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 50;
        const offset = (page - 1) * limit;

        // Get audit logs
        const logs = await db.select()
            .from(auditLogs)
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
            .offset(offset);

        // Count total logs for pagination
        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs);

        const totalCount = countResult[0]?.count || 0;

        return {
            success: true,
            logs,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }, {
        query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String())
        })
    });
