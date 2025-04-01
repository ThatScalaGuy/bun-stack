import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBackend } from '../../context/BackendContext';
import {
    LoginCredentials,
    RegistrationData,
    ResetPasswordRequest,
    ResetPasswordConfirm,
    VerificationRequest,
} from '../../types/user';


export function useAuthQueries() {
    const backend = useBackend();
    const queryClient = useQueryClient();

    // Get current user
    const currentUser = useQuery({
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
        mutationFn: async (credentials: LoginCredentials) => {
            const { data, error } = await backend.api.auth.login.post(credentials);
            if (error) {
                throw new Error(error.value.message);
            }
            return data;
        },
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
        mutationFn: async (registrationData: RegistrationData) => {
            const { data, error } = await backend.api.auth.register.post(registrationData);
            if (error) {
                throw new Error(error.value.message);
            }
            return data;
        },
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

    return {
        currentUser: {
            data: currentUser.data,
            isLoading: currentUser.isLoading,
            error: currentUser.error,
        },
        login,
        logout,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        verifyAccount,
    };
}
