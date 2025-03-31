import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
    children: ReactNode;
    requiredRole?: string;
}

export const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
    const { isAuthenticated, isLoadingUser, hasRole } = useAuth();
    const location = useLocation();

    // Redirect unauthenticated users to login
    if (!isLoadingUser && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check for required role if specified
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Show loading state
    if (isLoadingUser) {
        return <div>Loading...</div>;
    }

    // Render protected content
    return <>{children}</>;
};
