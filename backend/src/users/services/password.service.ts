import { hash, verify } from "@node-rs/argon2";
import { createId } from "@paralleldrive/cuid2";

/**
 * Service for password hashing and verification using Argon2id
 */
export const PasswordService = {
    /**
     * Hash a password using Argon2id with secure defaults
     * @param password Plain text password to hash
     * @returns Secure password hash
     */
    hashPassword: async (password: string): Promise<string> => {
        // Use Argon2id with strong parameters recommended by OWASP
        return await hash(password, {
            memoryCost: 65536, // 64 MB
            timeCost: 3,       // 3 iterations
            outputLen: 32,     // 32 bytes output
            parallelism: 4,    // 4 threads
        });
    },

    /**
     * Verify if a provided password matches the stored hash
     * @param password Plain text password to verify
     * @param hash The stored password hash to verify against
     * @returns Boolean indicating if the password matches
     */
    verifyPassword: async (password: string, existingHash: string): Promise<boolean> => {
        try {
            return await verify(existingHash, password);
        } catch (error) {
            console.error("Password verification error:", error);
            return false;
        }
    },

    /**
     * Generate a secure random token for password reset or email verification
     * @returns A secure random token
     */
    generateSecureToken: (): string => {
        // Generate a secure token using CUID2 (cryptographically secure)
        const tokenId = createId();
        // Add additional entropy
        const randomBytes = Array.from(
            { length: 16 },
            () => Math.floor(Math.random() * 36).toString(36)
        ).join("");

        return `${tokenId}${randomBytes}`;
    },
};
