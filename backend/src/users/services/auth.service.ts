import {
    RegisterUserInput,
    LoginUserInput,
    RequestPasswordResetInput,
    ResetPasswordInput,
    ChangePasswordInput,
    UserJwtPayload,
    MfaSetupInput,
    MfaVerifyInput
} from "../types";
import { UserRepository } from "../repositories/user.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { EmailService } from "./email.service";
import { MfaService } from "./mfa.service";

/**
 * Service for authentication operations
 * Handles core authentication logic and workflows
 */
export const AuthService = {
    /**
     * Register a new user
     * @param userData Registration data
     * @param ipAddress Client IP address
     * @returns Object with success status and user/errors
     */
    register: async (userData: RegisterUserInput, ipAddress?: string) => {
        try {
            // Check if email is already registered
            const existingUser = await UserRepository.findByEmail(userData.email);

            if (existingUser) {
                return {
                    success: false,
                    error: "Email is already registered"
                };
            }

            // Create user
            const user = await UserRepository.create(userData);

            // Generate email verification token
            const emailToken = await AuthRepository.createEmailVerificationToken(user.id);

            // Send verification email
            await EmailService.sendVerificationEmail(user.email, emailToken.token, user.displayName);

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.registered",
                { userId: user.id, email: user.email },
                user.id,
                ipAddress
            );

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName
                }
            };
        } catch (error) {
            console.error("Registration error:", error);
            return {
                success: false,
                error: "Failed to register user"
            };
        }
    },

    /**
     * Verify a user's email address
     * @param token Email verification token
     * @returns Object with success status and message
     */
    verifyEmail: async (token: string) => {
        try {
            // Validate token
            const emailToken = await AuthRepository.validateEmailVerificationToken(token);

            if (!emailToken) {
                return {
                    success: false,
                    error: "Invalid or expired token"
                };
            }

            // Mark email as verified
            const updated = await UserRepository.markEmailAsVerified(emailToken.userId);

            if (!updated) {
                return {
                    success: false,
                    error: "Failed to verify email"
                };
            }

            // Mark token as used
            await AuthRepository.markEmailVerificationTokenAsUsed(emailToken.id);

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.email_verified",
                { userId: emailToken.userId },
                emailToken.userId
            );

            return {
                success: true,
                message: "Email verified successfully"
            };
        } catch (error) {
            console.error("Email verification error:", error);
            return {
                success: false,
                error: "Failed to verify email"
            };
        }
    },

    /**
     * Login a user
     * @param credentials Login credentials
     * @param ipAddress Client IP address
     * @param userAgent Client user agent
     * @returns Object with success status and tokens/errors
     */
    login: async (credentials: LoginUserInput, ipAddress?: string, userAgent?: string) => {
        try {
            // Find user by email
            const user = await UserRepository.findByEmail(credentials.email);

            if (!user) {
                return {
                    success: false,
                    error: "Invalid email or password"
                };
            }

            // Check if account is locked
            const isLocked = await UserRepository.isAccountLocked(user.id);

            if (isLocked) {
                return {
                    success: false,
                    error: "Account is locked due to failed login attempts"
                };
            }

            // Verify password
            const isPasswordValid = await PasswordService.verifyPassword(credentials.password, user.passwordHash);

            if (!isPasswordValid) {
                // Update failed login attempts
                await UserRepository.updateLoginAttempts(user.id, true);

                return {
                    success: false,
                    error: "Invalid email or password"
                };
            }

            // Reset failed login attempts
            await UserRepository.updateLoginAttempts(user.id, false);

            // Check if user is active
            if (!user.isActive) {
                return {
                    success: false,
                    error: "User account is inactive"
                };
            }

            // Get user roles
            const userRoles = await UserRepository.getUserRoles(user.id);

            // Check if user has MFA
            const mfaSettings = await AuthRepository.findMfaByUserId(user.id);

            if (mfaSettings) {
                // Generate step-up token for MFA
                const stepUpToken = await MfaService.generateMfaStepUpToken(user.id, user.email, userRoles);

                return {
                    success: true,
                    stepUpToken
                };
            }

            // Generate access and refresh tokens
            const accessToken = await TokenService.generateToken({
                sub: user.id,
                email: user.email,
                roles: userRoles
            });

            const refreshToken = await TokenService.generateRefreshToken(user.id);

            // Create session
            await AuthRepository.createSession(user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), ipAddress, userAgent);

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.logged_in",
                { userId: user.id },
                user.id,
                ipAddress,
                userAgent
            );

            return {
                success: true,
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName
                }
            };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: "Failed to login"
            };
        }
    },

    /**
     * Complete MFA step-up authentication
     * @param stepUpToken Token from initial login
     * @param mfaCode MFA verification code
     * @returns Object with success status and tokens/errors
     */
    completeMfaLogin: async (stepUpToken: string, mfaCode: string, ipAddress?: string, userAgent?: string) => {
        try {
            // Verify step-up token
            const payload = await TokenService.verifyToken(stepUpToken);

            if (!payload || !payload.sub) {
                return {
                    success: false,
                    error: "Invalid step-up token"
                };
            }

            // Find user
            const user = await UserRepository.findById(payload.sub);

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Find MFA settings
            const mfaSettings = await AuthRepository.findMfaByUserId(user.id);

            if (!mfaSettings) {
                return {
                    success: false,
                    error: "MFA settings not found"
                };
            }

            // Verify MFA code
            const isCodeValid = MfaService.verifyTotpToken(mfaSettings.secret, mfaCode);

            if (!isCodeValid) {
                return {
                    success: false,
                    error: "Invalid MFA code"
                };
            }

            // Generate access and refresh tokens
            const userRoles = await UserRepository.getUserRoles(user.id);

            const accessToken = await TokenService.generateToken({
                sub: user.id,
                email: user.email,
                roles: userRoles,
                mfaVerified: true
            });

            const refreshToken = await TokenService.generateRefreshToken(user.id);

            // Create session
            await AuthRepository.createSession(user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), ipAddress, userAgent);

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.mfa_login_completed",
                { userId: user.id },
                user.id,
                ipAddress,
                userAgent
            );

            return {
                success: true,
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName
                }
            };
        } catch (error) {
            console.error("MFA login error:", error);
            return {
                success: false,
                error: "Failed to complete MFA login"
            };
        }
    },

    /**
     * Request a password reset
     * @param email User email
     * @param ipAddress Client IP address
     * @returns Object with success status
     */
    requestPasswordReset: async (email: string, ipAddress?: string) => {
        try {
            // Find user by email
            const user = await UserRepository.findByEmail(email);

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Create password reset token
            const resetToken = await AuthRepository.createPasswordResetToken(user.id);

            // Send password reset email
            await EmailService.sendPasswordResetEmail(user.email, resetToken.token);

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.password_reset_requested",
                { userId: user.id },
                user.id,
                ipAddress
            );

            return {
                success: true,
                message: "Password reset email sent"
            };
        } catch (error) {
            console.error("Password reset request error:", error);
            return {
                success: false,
                error: "Failed to request password reset"
            };
        }
    },

    /**
     * Reset a user's password using a token
     * @param resetData Password reset data
     * @param ipAddress Client IP address
     * @returns Object with success status
     */
    resetPassword: async (resetData: ResetPasswordInput, ipAddress?: string) => {
        try {
            // Validate reset token
            const resetToken = await AuthRepository.validatePasswordResetToken(resetData.token);

            if (!resetToken) {
                return {
                    success: false,
                    error: "Invalid or expired token"
                };
            }

            // Hash new password
            const newPasswordHash = await PasswordService.hashPassword(resetData.password);

            // Update user's password
            const updated = await UserRepository.updatePassword(resetToken.userId, newPasswordHash);

            if (!updated) {
                return {
                    success: false,
                    error: "Failed to reset password"
                };
            }

            // Mark token as used
            await AuthRepository.markPasswordResetTokenAsUsed(resetToken.id);

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.password_reset_completed",
                { userId: resetToken.userId },
                resetToken.userId,
                ipAddress
            );

            return {
                success: true,
                message: "Password reset successfully"
            };
        } catch (error) {
            console.error("Password reset error:", error);
            return {
                success: false,
                error: "Failed to reset password"
            };
        }
    },

    /**
     * Change a user's password (when already authenticated)
     * @param userId User ID
     * @param changeData Password change data
     * @returns Object with success status
     */
    changePassword: async (userId: string, changeData: ChangePasswordInput) => {
        try {
            // Find user
            const user = await UserRepository.findById(userId);

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Verify current password
            const isPasswordValid = await PasswordService.verifyPassword(changeData.currentPassword, user.passwordHash);

            if (!isPasswordValid) {
                return {
                    success: false,
                    error: "Current password is incorrect"
                };
            }

            // Hash new password
            const newPasswordHash = await PasswordService.hashPassword(changeData.newPassword);

            // Update user's password
            const updated = await UserRepository.updatePassword(user.id, newPasswordHash);

            if (!updated) {
                return {
                    success: false,
                    error: "Failed to change password"
                };
            }

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.password_changed",
                { userId: user.id },
                user.id
            );

            return {
                success: true,
                message: "Password changed successfully"
            };
        } catch (error) {
            console.error("Password change error:", error);
            return {
                success: false,
                error: "Failed to change password"
            };
        }
    },

    /**
     * Logout a user by revoking their session
     * @param refreshToken Refresh token to revoke
     * @param userId User ID
     * @returns Object with success status
     */
    logout: async (refreshToken: string, userId?: string) => {
        try {
            // Find session by token
            const session = await AuthRepository.findSessionByToken(refreshToken);

            if (!session) {
                return {
                    success: false,
                    error: "Invalid refresh token"
                };
            }

            // Revoke session
            const revoked = await AuthRepository.revokeSession(session.id);

            if (!revoked) {
                return {
                    success: false,
                    error: "Failed to logout"
                };
            }

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.logged_out",
                { sessionId: session.id },
                userId
            );

            return {
                success: true,
                message: "Logged out successfully"
            };
        } catch (error) {
            console.error("Logout error:", error);
            return {
                success: false,
                error: "Failed to logout"
            };
        }
    },

    /**
     * Setup MFA for a user
     * @param userId User ID
     * @param setupData MFA setup data
     * @returns Object with MFA setup info
     */
    setupMfa: async (userId: string, setupData: MfaSetupInput) => {
        try {
            // Find user
            const user = await UserRepository.findById(userId);

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Check if user already has MFA enabled
            const existingMfa = await AuthRepository.findMfaByUserId(userId);

            if (existingMfa) {
                return {
                    success: false,
                    error: "MFA is already set up for this account"
                };
            }

            if (setupData.type === "totp") {
                // Generate TOTP secret
                const { secret, qrCodeUrl } = MfaService.generateTotpSecret(
                    user.email,
                    Bun.env.APP_NAME || "MyApp"
                );

                // Store unverified MFA record
                const mfa = await AuthRepository.createMfa(userId, setupData.type, secret);

                // Log audit event
                await AuthRepository.logAuditEvent(
                    "user.mfa_setup_initiated",
                    { type: setupData.type, mfaId: mfa.id },
                    userId
                );

                return {
                    success: true,
                    mfaId: mfa.id,
                    secret,
                    qrCodeUrl
                };
            } else {
                return {
                    success: false,
                    error: "Unsupported MFA type"
                };
            }
        } catch (error) {
            console.error("MFA setup error:", error);
            return {
                success: false,
                error: "Failed to set up MFA"
            };
        }
    },

    /**
     * Verify MFA setup with a code
     * @param userId User ID
     * @param verifyData MFA verification data
     * @returns Object with success status
     */
    verifyMfa: async (userId: string, verifyData: MfaVerifyInput) => {
        try {
            // Find MFA record
            const mfa = await AuthRepository.findMfaById(verifyData.mfaId);

            if (!mfa || mfa.userId !== userId) {
                return {
                    success: false,
                    error: "Invalid MFA setup"
                };
            }

            if (mfa.isVerified) {
                return {
                    success: false,
                    error: "MFA is already verified"
                };
            }

            let isCodeValid = false;

            // Verify code based on MFA type
            if (mfa.type === "totp") {
                isCodeValid = MfaService.verifyTotpToken(mfa.secret, verifyData.code);
            } else {
                return {
                    success: false,
                    error: "Unsupported MFA type"
                };
            }

            if (!isCodeValid) {
                return {
                    success: false,
                    error: "Invalid verification code"
                };
            }

            // Mark MFA as verified
            await AuthRepository.markMfaAsVerified(mfa.id);

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.mfa_setup_completed",
                { type: mfa.type, mfaId: mfa.id },
                userId
            );

            return {
                success: true,
                message: "MFA setup verified successfully"
            };
        } catch (error) {
            console.error("MFA verification error:", error);
            return {
                success: false,
                error: "Failed to verify MFA setup"
            };
        }
    },

    /**
     * Remove MFA for a user
     * @param userId User ID
     * @returns Object with success status
     */
    removeMfa: async (userId: string) => {
        try {
            // Find MFA record
            const mfa = await AuthRepository.findMfaByUserId(userId);

            if (!mfa) {
                return {
                    success: false,
                    error: "No MFA setup found for this user"
                };
            }

            // Delete MFA
            const deleted = await AuthRepository.deleteMfa(mfa.id);

            if (!deleted) {
                return {
                    success: false,
                    error: "Failed to remove MFA"
                };
            }

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.mfa_removed",
                { mfaId: mfa.id, type: mfa.type },
                userId
            );

            return {
                success: true,
                message: "MFA has been removed successfully"
            };
        } catch (error) {
            console.error("MFA removal error:", error);
            return {
                success: false,
                error: "Failed to remove MFA"
            };
        }
    },

    /**
     * Refresh an access token using a refresh token
     * @param refreshToken Refresh token
     * @returns Object with new access token or error
     */
    refreshToken: async (refreshToken: string) => {
        try {
            // Validate the refresh token (find session)
            const session = await AuthRepository.findSessionByToken(refreshToken);

            if (!session) {
                return {
                    success: false,
                    error: "Invalid refresh token"
                };
            }

            // Find user
            const user = await UserRepository.findById(session.userId);

            if (!user) {
                return {
                    success: false,
                    error: "User not found"
                };
            }

            // Check if user is active
            if (!user.isActive) {
                // Revoke session
                await AuthRepository.revokeSession(session.id);

                return {
                    success: false,
                    error: "User account is inactive"
                };
            }

            // Get user roles
            const userRoles = await UserRepository.getUserRoles(user.id);

            // Check if user has MFA
            const mfaSettings = await AuthRepository.findMfaByUserId(user.id);

            // Generate new access token
            const accessToken = await TokenService.generateToken({
                sub: user.id,
                email: user.email,
                roles: userRoles,
                mfaVerified: mfaSettings ? true : undefined
            });

            // Log audit event
            await AuthRepository.logAuditEvent(
                "user.token_refresh",
                { sessionId: session.id },
                user.id
            );

            return {
                success: true,
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName
                }
            };
        } catch (error) {
            console.error("Token refresh error:", error);
            return {
                success: false,
                error: "Failed to refresh token"
            };
        }
    }
};