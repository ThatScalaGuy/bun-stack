import { connection as db } from "../database";
import { roles } from "../database/schema";
import { eq } from "drizzle-orm";

/**
 * Seed default roles in the database
 * This ensures that the basic roles needed for RBAC are available
 */
export const seedRoles = async () => {
    console.log("Checking for default roles...");

    // Default roles to create
    const defaultRoles = [
        {
            name: "admin",
            description: "Administrator with full system access"
        },
        {
            name: "user",
            description: "Standard user with basic permissions"
        },
        {
            name: "moderator",
            description: "User with additional moderation permissions"
        }
    ];

    for (const role of defaultRoles) {
        // Check if role already exists
        const existingRole = await db.select()
            .from(roles)
            .where(eq(roles.name, role.name))
            .limit(1);

        if (existingRole.length === 0) {
            // Create the role if it doesn't exist
            await db.insert(roles).values({
                name: role.name,
                description: role.description
            });
            console.log(`Created role: ${role.name}`);
        } else {
            console.log(`Role already exists: ${role.name}`);
        }
    }

    console.log("Role seeding completed.");
};
