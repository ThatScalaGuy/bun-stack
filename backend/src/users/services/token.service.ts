import { SignJWT, jwtVerify } from "jose";
import { createId } from "@paralleldrive/cuid2";
import { UserJwtPayload } from "../types";

/**
 * Service for JWT token management
 * Uses the Web Crypto API with jose for JWT operations
 */
export const TokenService = {
    /**
     * Get the JWT secret
     * @returns JWT secret as Uint8Array
     */
    getJwtSecret: (): Uint8Array => {
        const jwtSecret = Bun.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET environment variable is not set");
        }

        return new TextEncoder().encode(jwtSecret);
    },

    /**
     * Generate a JWT token for a user
     * @param payload User payload for token
     * @param expiresIn JWT expiration time in seconds
     * @returns JWT token string
     */
    generateToken: async (
        payload: UserJwtPayload,
        expiresIn: number = 3600 // 1 hour default
    ): Promise<string> => {
        const jwtSecret = TokenService.getJwtSecret();

        const token = await new SignJWT({
            ...payload,
            jti: createId(), // Add unique JWT ID to prevent replay attacks
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
            .sign(jwtSecret);

        return token;
    },

    /**
     * Verify and decode a JWT token
     * @param token JWT token to verify
     * @returns Decoded token payload or null if invalid
     */
    verifyToken: async (token: string): Promise<UserJwtPayload | null> => {
        try {
            const jwtSecret = TokenService.getJwtSecret();
            const { payload } = await jwtVerify(token, jwtSecret);

            return payload as unknown as UserJwtPayload;
        } catch (error) {
            console.error("Token verification failed:", error);
            return null;
        }
    },

    /**
     * Generate a refresh token
     * @param userId User ID for refresh token
     * @returns Refresh token with longer expiration
     */
    generateRefreshToken: async (userId: string): Promise<string> => {
        const payload: UserJwtPayload = {
            sub: userId,
            email: "", // Minimal data in refresh token
            roles: [],
        };

        // Generate token with a longer expiration (7 days)
        return TokenService.generateToken(payload, 7 * 24 * 60 * 60);
    },

    /**
     * Extract token from Authorization header
     * @param authHeader Authorization header
     * @returns Token string or null
     */
    extractTokenFromHeader: (authHeader?: string): string | null => {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        return authHeader.substring(7); // Remove "Bearer " prefix
    },
};
