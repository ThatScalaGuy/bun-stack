import { Elysia, t } from "elysia";
import {
    UpdateProfileSchema,
    ChangePasswordSchema,
    MfaSetupSchema,
    MfaVerifySchema
} from "../types";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import { authMiddleware } from "../middleware/auth.middleware";

/**
 * User controller
 * Handles user profile and settings-related API endpoints
 */
export const userController = new Elysia({ prefix: "/users" })
    .use(authMiddleware)
    /**
     * Get current user profile
     * GET /users/me
     */
    .get("/me",
        async ({ requireAuthentication, error }) => {
            const [user, roles] = requireAuthentication()

            const profile = await UserRepository.getProfileWithUserData(user.id);

            if (!profile) {
                return error(404, { message: "User not found" });
            }
            return {
                profile: {
                    ...profile,
                    roles
                }
            };
        }
    )

    /**
     * Update user profile
     * PUT /users/me
     */
    .put("/me",
        async ({ body, error, userId }) => {
            if (!userId) {
                return error(401, { message: "Authentication required" });
            }

            // Update user profile
            const updated = await UserRepository.updateProfile(userId, body);

            if (!updated) {
                return error(400, { message: "Failed to update profile" });
            }

            return {
                success: true,
                message: "Profile updated successfully"
            };
        },
        { body: UpdateProfileSchema }
    )

    /**
     * Change user password
     * POST /users/change-password
     */
    .post("/change-password",
        async ({ body, error, userId }) => {
            if (!userId) {
                return error(401, { message: "Authentication required" });
            }

            const result = await AuthService.changePassword(userId, body);

            if (!result.success) {
                return error(400, { message: result.error });
            }

            return {
                success: true,
                message: "Password changed successfully"
            };
        },
        { body: ChangePasswordSchema }
    )

    /**
     * Setup MFA
     * POST /users/me/mfa/setup
     */
    .post("/me/mfa/setup",
        async ({ body, userId, error }) => {
            if (!userId) {
                return error(401, "Authentication required");
            }

            const result = await AuthService.setupMfa(userId, body);

            if (!result.success) {
                return error(400, result.error);
            }

            return {
                mfaId: result.mfaId,
                secret: result.secret,
                qrCodeUrl: result.qrCodeUrl
            };
        },
        {
            body: MfaSetupSchema,
        }
    )

    /**
     * Verify MFA setup
     * POST /users/me/mfa/verify
     */
    .post("/me/mfa/verify",
        async ({ body, userId, set }) => {
            if (!userId) {
                set.status = 401;
                return { success: false, error: "Authentication required" };
            }

            const result = await AuthService.verifyMfa(userId, body);

            if (!result.success) {
                set.status = 400;
                return { success: false, error: result.error };
            }

            return {
                success: true,
                message: result.message
            };
        },
        {
            body: MfaVerifySchema,
        }
    )

    /**
     * Remove MFA
     * DELETE /users/me/mfa
     */
    .delete("/me/mfa",
        async ({ userId, error }) => {
            if (!userId) {
                return error(401, "Authentication required");
            }

            const result = await AuthService.removeMfa(userId);

            if (!result.success) {
                return error(400, result.error);
            }

            return {
                message: result.message
            };
        },
    );
