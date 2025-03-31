import { connection as db } from "../../database";
import { roles, userRoles } from "../../database/schema";
import { eq, sql, and } from "drizzle-orm";

/**
 * Repository for role management operations
 * Handles database interactions for roles and user role assignments
 */
export const RoleRepository = {
    /**
     * Get all available roles
     * @returns List of all roles
     */
    getAllRoles: async () => {
        return await db.select().from(roles);
    },

    /**
     * Find a role by name
     * @param name Role name
     * @returns Role or undefined if not found
     */
    findRoleByName: async (name: string) => {
        const result = await db
            .select()
            .from(roles)
            .where(eq(roles.name, name))
            .limit(1);

        return result[0];
    },

    /**
     * Create a new role
     * @param name Role name
     * @param description Role description
     * @returns Created role
     */
    createRole: async (name: string, description?: string) => {
        const result = await db.insert(roles)
            .values({
                name,
                description
            })
            .returning();

        return result[0];
    },

    /**
     * Update a role
     * @param id Role ID
     * @param name New role name
     * @param description New role description
     * @returns Updated role or undefined
     */
    updateRole: async (id: string, name?: string, description?: string) => {
        const result = await db.update(roles)
            .set({
                name: name,
                description: description
            })
            .where(eq(roles.id, id))
            .returning();

        return result[0];
    },

    /**
     * Delete a role
     * @param id Role ID
     * @returns Boolean indicating success
     */
    deleteRole: async (id: string) => {
        const result = await db.delete(roles)
            .where(eq(roles.id, id))
            .returning({ id: roles.id });

        return result.length > 0;
    },

    /**
     * Assign a role to a user
     * @param userId User ID
     * @param roleId Role ID
     * @returns Boolean indicating success
     */
    assignRoleToUser: async (userId: string, roleId: string) => {
        try {
            const result = await db.insert(userRoles)
                .values({
                    userId,
                    roleId
                })
                .returning();

            return result.length > 0;
        } catch (error) {
            // Handle case where the role assignment already exists
            return false;
        }
    },

    /**
     * Remove a role from a user
     * @param userId User ID
     * @param roleId Role ID
     * @returns Boolean indicating success
     */
    removeRoleFromUser: async (userId: string, roleId: string) => {
        const result = await db.delete(userRoles)
            .where(and(
                eq(userRoles.userId, userId),
                eq(userRoles.roleId, roleId)
            ))
            .returning({ userId: userRoles.userId });

        return result.length > 0;
    },

    /**
     * Check if a user has a specific role
     * @param userId User ID
     * @param roleName Role name
     * @returns Boolean indicating if the user has the role
     */
    userHasRole: async (userId: string, roleName: string) => {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(and(
                eq(userRoles.userId, userId),
                eq(roles.name, roleName)
            ));

        return result[0]?.count > 0;
    },

    /**
     * Get all roles for a user
     * @param userId User ID
     * @returns List of user's roles
     */
    getUserRoles: async (userId: string) => {
        return await db
            .select({
                id: roles.id,
                name: roles.name,
                description: roles.description
            })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, userId));
    }
};
