import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { permissionsMiddleware } from "../middleware/permissions.middleware";
import { RoleRepository } from "../repositories/role.repository";
import { PERMISSIONS, getPermissionsForRole } from "../utils/rbac";
import { AuthRepository } from "../repositories/auth.repository";
import { connection as db } from "../../database";
import { roles } from "../../database/schema";
import { eq } from "drizzle-orm";

/**
 * Role controller
 * Handles role management operations
 */
export const roleController = new Elysia({ prefix: "/roles" })
    .use(authMiddleware)
    .use(permissionsMiddleware)

    /**
     * Get all roles
     * GET /api/roles
     */
    .get("/", async ({ requirePermission }) => {
        // Only users with permission to view roles can access
        requirePermission(PERMISSIONS.USER_VIEW);

        const allRoles = await RoleRepository.getAllRoles();

        return {
            success: true,
            roles: allRoles
        };
    })

    /**
     * Get role permissions
     * GET /api/roles/:name/permissions
     */
    .get("/:name/permissions", async ({ params, set, requirePermission }) => {
        // Only users with permission to view roles can access
        requirePermission(PERMISSIONS.USER_VIEW);

        const role = await RoleRepository.findRoleByName(params.name);

        if (!role) {
            set.status = 404;
            return { success: false, error: "Role not found" };
        }

        const permissions = getPermissionsForRole(role.name);

        return {
            success: true,
            role: role.name,
            permissions
        };
    }, {
        params: t.Object({
            name: t.String()
        })
    })

    /**
     * Create new role
     * POST /api/roles
     */
    .post("/", async ({ body, requirePermission }) => {
        // Only admins can create roles
        requirePermission(PERMISSIONS.ADMIN_MANAGE_ROLES);

        const existingRole = await RoleRepository.findRoleByName(body.name);

        if (existingRole) {
            return { success: false, error: "Role with this name already exists" };
        }

        const newRole = await RoleRepository.createRole(body.name, body.description);

        // Log audit event
        await AuthRepository.logAuditEvent(
            "admin.create_role",
            { roleName: body.name }
        );

        return {
            success: true,
            role: newRole
        };
    }, {
        body: t.Object({
            name: t.String(),
            description: t.Optional(t.String())
        })
    })

    /**
     * Update a role
     * PUT /api/roles/:id
     */
    .put("/:id", async ({ params, body, set, requirePermission }) => {
        // Only admins can update roles
        requirePermission(PERMISSIONS.ADMIN_MANAGE_ROLES);

        // Check if new name is already taken by another role
        if (body.name) {
            const existingRole = await RoleRepository.findRoleByName(body.name);
            if (existingRole && existingRole.id !== params.id) {
                set.status = 400;
                return { success: false, error: "Role with this name already exists" };
            }
        }

        const updatedRole = await RoleRepository.updateRole(
            params.id,
            body.name,
            body.description
        );

        if (!updatedRole) {
            set.status = 404;
            return { success: false, error: "Role not found" };
        }

        // Log audit event
        await AuthRepository.logAuditEvent(
            "admin.update_role",
            { roleId: params.id, roleName: body.name }
        );

        return {
            success: true,
            role: updatedRole
        };
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1 })),
            description: t.Optional(t.String())
        })
    })

    /**
     * Delete a role
     * DELETE /api/roles/:id
     */
    .delete("/:id", async ({ params, set, requirePermission }) => {
        // Only admins can delete roles
        requirePermission(PERMISSIONS.ADMIN_MANAGE_ROLES);

        // Get role details for audit log before deletion
        const roleDetails = await db.select()
            .from(roles)
            .where(eq(roles.id, params.id))
            .limit(1);

        const deleted = await RoleRepository.deleteRole(params.id);

        if (!deleted) {
            set.status = 404;
            return { success: false, error: "Role not found or could not be deleted" };
        }

        // Log audit event
        await AuthRepository.logAuditEvent(
            "admin.delete_role",
            { roleId: params.id, roleName: roleDetails[0]?.name }
        );

        return {
            success: true,
            message: "Role deleted successfully"
        };
    }, {
        params: t.Object({
            id: t.String()
        })
    });

export default roleController;
