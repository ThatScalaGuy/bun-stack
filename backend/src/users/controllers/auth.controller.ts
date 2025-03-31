import { Elysia, t } from "elysia";
import {
    RegisterUserSchema,
    LoginUserSchema,
    RequestPasswordResetSchema,
    ResetPasswordSchema,
    VerifyEmailSchema
} from "../types";
import { AuthService } from "../services/auth.service";
import { authMiddleware } from "../middleware/auth.middleware";

/**
 * Authentication controller
 * Handles all authentication-related API endpoints
 */
export const authController = new Elysia({ prefix: "/auth" })
    .use(authMiddleware)
    .onRequest(({ set }) => {
        set.headers["Access-Control-Allow-Credentials"] = "true";
    })

    /**
     * Register a new user
     * POST /auth/register
     */
    .post("/register",
        async ({ body, request, set }) => {
            // Get client IP address
            const ipAddress = request.headers.get("X-Forwarded-For") ||
                request.headers.get("CF-Connecting-IP") ||
                "unknown";

            const result = await AuthService.register(body, ipAddress);

            if (!result.success) {
                set.status = 400;
                return { success: false, error: result.error };
            }

            return {
                success: true,
                message: "Registration successful! Please check your email to verify your account.",
                user: result.user
            };
        },
        { body: RegisterUserSchema }
    )

    /**
     * Verify email address
     * POST /auth/verify-email
     */
    .post("/verify-email",
        async ({ body, set }) => {
            const result = await AuthService.verifyEmail(body.token);

            if (!result.success) {
                set.status = 400;
                return { success: false, error: result.error };
            }

            return {
                success: true,
                message: "Email verified successfully. You can now log in."
            };
        },
        { body: VerifyEmailSchema }
    )

    /**
     * Login
     * POST /auth/login
     */
    .post("/login",
        async ({ body, request, set, cookie }) => {
            // Get client info
            const ipAddress = request.headers.get("X-Forwarded-For") ||
                request.headers.get("CF-Connecting-IP") ||
                "unknown";
            const userAgent = request.headers.get("User-Agent") || "unknown";

            const result = await AuthService.login(body, ipAddress, userAgent);

            if (!result.success) {
                set.status = 400;
                return { success: false, error: result.error };
            }

            // If MFA is required, return step-up token
            if (result.stepUpToken) {
                return {
                    success: true,
                    requireMfa: true,
                    stepUpToken: result.stepUpToken
                };
            }

            cookie.refresh_token.value = result.refreshToken as string;

            return {
                success: true,
                accessToken: result.accessToken,
                user: result.user
            };
        },
        { body: LoginUserSchema }
    )

    /**
     * Complete MFA verification
     * POST /auth/mfa/verify
     */
    .post("/mfa/verify",
        async ({ body, request, set, cookie }) => {
            const stepUpToken = body.stepUpToken;
            const mfaCode = body.code;

            // Get client info
            const ipAddress = request.headers.get("X-Forwarded-For") ||
                request.headers.get("CF-Connecting-IP") ||
                "unknown";
            const userAgent = request.headers.get("User-Agent") || "unknown";

            const result = await AuthService.completeMfaLogin(
                stepUpToken,
                mfaCode,
                ipAddress,
                userAgent
            );

            if (!result.success) {
                set.status = 400;
                return { success: false, error: result.error };
            }

            // Set refresh token as HTTP-only cookie
            cookie.refresh_token.value = result.refreshToken as string;

            return {
                success: true,
                accessToken: result.accessToken,
                user: result.user
            };
        },
        {
            body: t.Object({
                stepUpToken: t.String(),
                code: t.String()
            })
        }
    )

    /**
     * Request password reset
     * POST /auth/request-password-reset
     */
    .post("/request-password-reset",
        async ({ body, request, set }) => {
            // Get client IP address
            const ipAddress = request.headers.get("X-Forwarded-For") ||
                request.headers.get("CF-Connecting-IP") ||
                "unknown";

            const result = await AuthService.requestPasswordReset(body.email, ipAddress);

            if (!result.success) {
                set.status = 400;
                return { success: false, error: result.error };
            }

            return {
                success: true,
                message: result.message || "If your email is registered, you'll receive a password reset link."
            };
        },
        { body: RequestPasswordResetSchema }
    )

    /**
     * Reset password
     * POST /auth/reset-password
     */
    .post("/reset-password",
        async ({ body, request, set }) => {
            // Get client IP address
            const ipAddress = request.headers.get("X-Forwarded-For") ||
                request.headers.get("CF-Connecting-IP") ||
                "unknown";

            const result = await AuthService.resetPassword(body, ipAddress);

            if (!result.success) {
                set.status = 400;
                return { success: false, error: result.error };
            }

            return {
                success: true,
                message: result.message
            };
        },
        { body: ResetPasswordSchema }
    )

    /**
     * Refresh access token
     * POST /auth/refresh
     */
    .post("/refresh",
        async ({ cookie, set }) => {
            const refreshToken = cookie.refresh_token?.value;

            if (!refreshToken) {
                set.status = 401;
                return { success: false, error: "Refresh token is required" };
            }

            const result = await AuthService.refreshToken(refreshToken);

            if (!result.success) {
                // Clear the invalid refresh token
                cookie.refresh_token.remove()

                set.status = 401;
                return { success: false, error: result.error };
            }

            return {
                success: true,
                accessToken: result.accessToken,
                user: result.user
            };
        }
    )

    /**
     * Logout
     * POST /auth/logout
     */
    .post("/logout",
        async ({ cookie, set, userId }) => {
            const refreshToken = cookie.refresh_token?.value;

            if (!refreshToken) {
                return { success: true, message: "Already logged out" };
            }

            if (!userId) {
                set.status = 401;
                return { success: false, error: "Authentication required" };
            }

            const result = await AuthService.logout(refreshToken, userId);

            // Always clear the cookie, even if the token wasn't valid
            cookie.refresh_token.remove()

            if (!result.success) {
                set.status = 400;
                return { success: false, error: result.error };
            }

            return {
                success: true,
                message: "Logged out successfully"
            };
        }
    );
