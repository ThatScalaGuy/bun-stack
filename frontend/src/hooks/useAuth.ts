import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackend } from '../context/BackendContext';
import {
    LoginCredentials,
    RegistrationData,
    ResetPasswordRequest,
    ResetPasswordConfirm,
    VerificationRequest,
    MfaVerifyRequest
} from '../types/user';
import { useCallback } from 'react';

export function useAuth() {
    const backend = useBackend();
    const queryClient = useQueryClient();

    // Get current user
    const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => backend.api.users.me.get().then(res => {
            if (res.status === 200) {
                return res.data?.profile
            }
            throw new Error('User not found');
        }),
        retry: false,
        staleTime: 300000, // 5 minutes
    });

    // Login
    const login = useMutation({
        mutationFn: (credentials: LoginCredentials) =>
            backend.api.auth.login.post(credentials).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });

    // Logout
    const logout = useMutation({
        mutationFn: () =>
            backend.api.auth.logout.post().then(res => res.data),
        onSuccess: () => {
            queryClient.setQueryData(['currentUser'], null);
        }
    });

    // Register
    const register = useMutation({
        mutationFn: (data: RegistrationData) =>
            backend.api.auth.register.post(data).then(res => res.data),
    });

    // Request password reset
    const requestPasswordReset = useMutation({
        mutationFn: (data: ResetPasswordRequest) =>
            backend.api.auth['request-password-reset'].post(data).then(res => res.data),

    });

    // Confirm password reset
    const confirmPasswordReset = useMutation({
        mutationFn: (data: ResetPasswordConfirm) =>
            backend.api.auth['reset-password'].post(data).then(res => res.data),

    });

    // Verify account
    const verifyAccount = useMutation({
        mutationFn: (data: VerificationRequest) =>
            backend.api.auth['verify-email'].post(data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });

    // MFA Setup
    const setupMfa = useMutation({
        mutationFn: () =>
            backend.api.users.me.mfa.setup.post({ type: 'totp' }).then(res => res.data),
    });

    // MFA Verify
    const verifyMfa = useMutation({
        mutationFn: (data: MfaVerifyRequest) =>
            backend.api.auth.mfa.verify.post(data).then(res => res.data),
    });

    // MFA Disable
    const disableMfa = useMutation({
        mutationFn: () =>
            backend.api.users.me.mfa.delete().then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });

    const isAuthenticated = !!user;

    const hasRole = useCallback((role: string) => {
        if (!user || !user.roles) return false;
        return user.roles.some(r => r === role);
    }, [user]);

    return {
        user,
        isLoadingUser,
        userError,
        isAuthenticated,
        hasRole,
        login,
        logout,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        verifyAccount,
        setupMfa,
        verifyMfa,
        disableMfa,
    };
}
