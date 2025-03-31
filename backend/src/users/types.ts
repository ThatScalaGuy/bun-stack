import { Type, Static } from '@sinclair/typebox'

/**
 * User registration input validation schema
 */
export const RegisterUserSchema = Type.Object({
    email: Type.String({ format: 'email', errorMessage: { format: 'Please provide a valid email address' } }),
    password: Type.String({
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$',
        errorMessage: {
            minLength: 'Password must be at least 8 characters',
            pattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }
    }),
    displayName: Type.String({
        minLength: 2,
        maxLength: 100,
        errorMessage: {
            minLength: 'Display name must be at least 2 characters',
            maxLength: 'Display name cannot exceed 100 characters'
        }
    })
});

export type RegisterUserInput = Static<typeof RegisterUserSchema>;

/**
 * Login input validation schema
 */
export const LoginUserSchema = Type.Object({
    email: Type.String({ format: 'email', errorMessage: { format: 'Please provide a valid email address' } }),
    password: Type.String({ minLength: 1, errorMessage: { minLength: 'Password is required' } }),
    mfaCode: Type.Optional(Type.String())
});

export type LoginUserInput = Static<typeof LoginUserSchema>;

/**
 * Password reset request validation schema
 */
export const RequestPasswordResetSchema = Type.Object({
    email: Type.String({ format: 'email', errorMessage: { format: 'Please provide a valid email address' } })
});

export type RequestPasswordResetInput = Static<typeof RequestPasswordResetSchema>;

/**
 * Password reset validation schema
 */
export const ResetPasswordSchema = Type.Object({
    token: Type.String({ minLength: 1, errorMessage: { minLength: 'Token is required' } }),
    password: Type.String({
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$',
        errorMessage: {
            minLength: 'Password must be at least 8 characters',
            pattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }
    })
});

export type ResetPasswordInput = Static<typeof ResetPasswordSchema>;

/**
 * Update profile validation schema
 */
export const UpdateProfileSchema = Type.Object({
    displayName: Type.Optional(Type.String({
        minLength: 2,
        maxLength: 100,
        errorMessage: {
            minLength: 'Display name must be at least 2 characters',
            maxLength: 'Display name cannot exceed 100 characters'
        }
    })),
    bio: Type.Optional(Type.String({
        maxLength: 500,
        errorMessage: { maxLength: 'Bio cannot exceed 500 characters' }
    })),
    preferences: Type.Optional(Type.Record(Type.String(), Type.Any()))
});

export type UpdateProfileInput = Static<typeof UpdateProfileSchema>;

/**
 * Change password validation schema
 */
export const ChangePasswordSchema = Type.Object({
    currentPassword: Type.String({ minLength: 1, errorMessage: { minLength: 'Current password is required' } }),
    newPassword: Type.String({
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$',
        errorMessage: {
            minLength: 'Password must be at least 8 characters',
            pattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }
    })
});

export type ChangePasswordInput = Static<typeof ChangePasswordSchema>;

/**
 * MFA setup validation schema
 */
export const MfaSetupSchema = Type.Object({
    type: Type.Union([Type.Literal('totp'), Type.Literal('sms')]),
    phoneNumber: Type.Optional(Type.String()) // Required only for SMS
});

export type MfaSetupInput = Static<typeof MfaSetupSchema>;

/**
 * MFA verify validation schema
 */
export const MfaVerifySchema = Type.Object({
    mfaId: Type.String(),
    code: Type.String({ minLength: 6, maxLength: 6 })
});

export type MfaVerifyInput = Static<typeof MfaVerifySchema>;

/**
 * Email verification validation schema
 */
export const VerifyEmailSchema = Type.Object({
    token: Type.String({ minLength: 1, errorMessage: { minLength: 'Token is required' } })
});

export type VerifyEmailInput = Static<typeof VerifyEmailSchema>;

/**
 * User JWT payload
 */
export interface UserJwtPayload {
    sub: string; // user ID
    email: string;
    roles: string[];
    iat?: number;
    exp?: number;
    mfaVerified?: boolean;
}
