import { connection as db } from "../database";
import { roles, userRoles } from "../database/schema";
import { eq } from "drizzle-orm";
import { UserRepository } from "../users/repositories/user.repository";
import { RoleRepository } from "../users/repositories/role.repository";

/**
 * Utility to assign admin role to a user by email
 * Useful for initial setup of admin accounts
 * 
 * @param email Email of the user to make admin
 */
export const assignAdminRole = async (email: string) => {
    try {
        console.log(`Attempting to assign admin role to user: ${email}`);

        // Find the user by email
        const user = await UserRepository.findByEmail(email);

        if (!user) {
            console.error(`User with email ${email} not found`);
            return false;
        }

        // Find the admin role
        const adminRole = await RoleRepository.findRoleByName('admin');

        if (!adminRole) {
            console.error('Admin role not found in the database');
            return false;
        }

        // Check if the user already has the admin role
        const hasAdmin = await RoleRepository.userHasRole(user.id, 'admin');

        if (hasAdmin) {
            console.log(`User ${email} already has admin role`);
            return true;
        }

        // Assign the admin role
        const result = await RoleRepository.assignRoleToUser(user.id, adminRole.id);

        if (result) {
            console.log(`Successfully assigned admin role to ${email}`);
            return true;
        } else {
            console.error(`Failed to assign admin role to ${email}`);
            return false;
        }
    } catch (error) {
        console.error('Error assigning admin role:', error);
        return false;
    }
};

/**
 * Execute this script directly to assign admin role
 * Example: bun run assign-admin-role.ts admin@example.com
 */
if (import.meta.main) {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address');
        process.exit(1);
    }

    const result = await assignAdminRole(email);

    if (result) {
        console.log('✅ Admin role assigned successfully');
        process.exit(0);
    } else {
        console.error('❌ Failed to assign admin role');
        process.exit(1);
    }
}
