import { generateSecret, verifyToken } from "node-2fa";
import { TokenService } from "./token.service";
import { UserJwtPayload } from "../types";

/**
 * Service for multi-factor authentication management
 */
export const MfaService = {
    /**
     * Generate a new TOTP secret for a user
     * @param email User email for secret generation
     * @returns Object containing the secret and QR code URI
     */
    generateTotpSecret: (email: string, issuer: string = "MyApp"): {
        secret: string;
        uri: string;
        qrCodeUrl: string;
    } => {
        const { secret, uri, qr } = generateSecret({
            name: email,
            account: ''
        });
        // TODO: check that
        return {
            secret: secret || "",
            uri: uri || "",
            qrCodeUrl: qr || "",
        };
    },

    /**
     * Verify a TOTP code against a secret
     * @param secret TOTP secret
     * @param token The provided TOTP token by user
     * @returns Boolean indicating if token is valid
     */
    verifyTotpToken: (secret: string, token: string): boolean => {
        // Validate the token
        const result = verifyToken(secret, token);

        // Return true only if token is valid and delta is 0 or 1
        // This means the token is either current or very recent
        if (result && (result.delta === 0 || result.delta === 1)) {
            return true;
        }

        return false;
    },

    /**
     * Generate an MFA step-up token (partial authentication)
     * Used when user has authenticated with password but needs to complete MFA
     * @param userId User ID for token
     * @param email User email
     * @param roles User roles
     * @returns JWT token with limited expiration for MFA completion
     */
    generateMfaStepUpToken: async (userId: string, email: string, roles: string[]): Promise<string> => {
        const payload: UserJwtPayload = {
            sub: userId,
            email,
            roles,
            mfaVerified: false, // This indicates MFA step is pending
        };

        // Generate short-lived token (5 minutes) for MFA completion
        return await TokenService.generateToken(payload, 300);
    },

    /**
     * Generate an MFA-verified token after successful MFA verification
     * @param stepUpToken The step-up token from first authentication phase
     * @returns Full-access JWT token with MFA verification flag
     */
    generateVerifiedToken: async (stepUpToken: string): Promise<string | null> => {
        const payload = await TokenService.verifyToken(stepUpToken);

        if (!payload) {
            return null;
        }

        // Create new token with MFA verified flag
        return await TokenService.generateToken({
            ...payload,
            mfaVerified: true,
        });
    },

    /**
     * Validates if a token includes MFA verification
     * @param token JWT token to check
     * @returns Boolean indicating if MFA is verified
     */
    isMfaVerified: async (token: string): Promise<boolean> => {
        const payload = await TokenService.verifyToken(token);

        if (!payload) {
            return false;
        }

        return !!payload.mfaVerified;
    },
};
