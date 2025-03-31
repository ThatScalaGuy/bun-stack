import { Elysia } from "elysia";
import { authController } from "./controllers/auth.controller";
import { userController } from "./controllers/user.controller";
import { adminController } from "./controllers/admin.controller";
import { roleController } from "./controllers/role.controller";

/**
 * Users module
 * Handles all user management and authentication functionality
 */
export const usersModule = new Elysia({ prefix: "/api" })
    .use(authController)
    .use(userController)
    .use(adminController)
    .use(roleController);
