import { Elysia } from "elysia";
import { TokenService } from "../services/token.service";
import { UserRepository } from "../repositories/user.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { UnauthorizedError, ForbiddenError } from "../../utils/error-handlers";

/**
 * Authentication middleware for securing API routes
 * Handles JWT verification and user authentication
 */
export const authMiddleware = new Elysia({ name: "auth" })
    // Authenticate user by JWT in Authorization header
    .derive(async ({ request, cookie }) => {
        // Check for token in header
        const authHeader = request.headers.get("Authorization");

        const requireAuthentication = () => {
            throw new UnauthorizedError("Authentication required");
        }

        const token = authHeader && TokenService.extractTokenFromHeader(authHeader);

        // If no token, check for cookie
        const cookieToken = !token ? cookie.access_token?.value : null;

        if (!token && !cookieToken) {
            return {
                user: null,
                userId: null,
                userRoles: [] as string[],
                requireAuthentication
            };
        }

        // Verify the token
        const finalToken = token || cookieToken || "";
        const payload = await TokenService.verifyToken(finalToken);

        if (!payload) {
            return {
                user: null,
                userId: null,
                userRoles: [] as string[],
                requireAuthentication
            };
        }

        // Check if the user exists and is active
        const user = await UserRepository.findById(payload.sub);
        if (!user || !user.isActive) {
            return {
                user: null,
                userId: null,
                userRoles: [] as string[],
                requireAuthentication
            };
        }

        const userRoles = payload.roles || [] as string[];

        return {
            user,
            userId: user.id,
            userRoles,
            hasMfaVerified: payload.mfaVerified || false,
            isAuthenticated: true,
            requireAuthentication: () => { return [user, userRoles] as const }
        };
    })

    // Define guard for requiring authentication
    // .guard({
    //     beforeHandle: ({ user, set }) => {
    //         if (!user) {
    //             set.status = 401;
    //             throw new UnauthorizedError("Authentication required");
    //         }
    //     }
    // })

    // , (app) => app.guard({
    //     // Define MFA guard for requiring MFA verification
    //     beforeHandle: async ({ user, hasMfaVerified, set }) => {
    //         if (!user) {
    //             set.status = 401;
    //             throw new UnauthorizedError("Authentication required");
    //         }

    //         if (!hasMfaVerified) {
    //             // Check if user has MFA enabled
    //             const mfa = await AuthRepository.findMfaByUserId(user.id);

    //             // Only enforce MFA if it's set up
    //             if (mfa) {
    //                 set.status = 401;
    //                 throw new UnauthorizedError("MFA verification required");
    //             }
    //         }
    //     }
    // }, (app) => app.derive((context) => ({
    //     // Role guard middleware for requiring specific roles
    //     requireRoles: (roleNames: string[]) => {
    //         const { userRoles, set } = context;

    //         // Check if user has any of the required roles
    //         const hasRequiredRole = roleNames.some(role =>
    //             userRoles?.includes(role)
    //         );

    //         if (!hasRequiredRole) {
    //             set.status = 403;
    //             throw new ForbiddenError("Insufficient permissions");
    //         }

    //         return true;
    //     }
    // }))))


    // .derive((context) => ({
    //     verifyCsrf: () => {
    //         const { request, set } = context;

    //         // Get CSRF token from header
    //         const csrfToken = request.headers.get("X-CSRF-Token");
    //         const origin = request.headers.get("Origin");
    //         const referer = request.headers.get("Referer");

    //         // Simple CSRF check - validate Origin/Referer against allowed domains
    //         const allowedOrigins = [
    //             process.env.FRONTEND_URL || "http://localhost:5173"
    //         ];

    //         const isValidOrigin = !origin || allowedOrigins.some(allowed => origin.startsWith(allowed));
    //         const isValidReferer = !referer || allowedOrigins.some(allowed => referer.startsWith(allowed));

    //         if (!isValidOrigin || !isValidReferer) {
    //             set.status = 403;
    //             throw new ForbiddenError("Invalid request origin");
    //         }

    //         return true;
    //     }
    // }))
    .as('plugin');
