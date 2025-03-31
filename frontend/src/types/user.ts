export interface User {
    id: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    isEmailVerified: boolean;
    isVerified?: boolean; // Keep for backward compatibility
    mfaEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
}

export interface UserWithRoles extends User {
    roles: Role[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegistrationData {
    email: string;
    password: string;
    displayName: string;
}

export interface ResetPasswordRequest {
    email: string;
}

export interface ResetPasswordConfirm {
    token: string;
    password: string;
}

export interface VerificationRequest {
    token: string;
}

export interface MfaSetupResponse {
    secret: string;
    qrCode: string;
}

export interface MfaVerifyRequest {
    code: string;
    stepUpToken: string;
}

export interface UpdateProfileData {
    displayName?: string;
    bio?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}
