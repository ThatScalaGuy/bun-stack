import { useCallback } from 'react';
import { useAuthQueries, useMfaQueries } from './queries';

export function useAuth() {
    const {
        currentUser: { data: user, isLoading: isLoadingUser, error: userError },
        login,
        logout,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        verifyAccount,
    } = useAuthQueries();

    const {
        setupMfa,
        verifyMfa,
        disableMfa,
    } = useMfaQueries();

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
