import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    hasRole: (role: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const {
        isAuthenticated,
        isLoadingUser,
        hasRole,
        logout,
        user
    } = useAuth();


    // Set up session timeout management
    useEffect(() => {
        let inactivityTimer: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            // Auto logout after 30 minutes of inactivity
            inactivityTimer = setTimeout(() => {
                if (isAuthenticated) {
                    logout.mutate();
                    window.location = "/login"
                    // navigate('/login', {
                    //     state: { message: 'You have been logged out due to inactivity' }
                    // });
                }
            }, 30 * 60 * 1000); // 30 minutes
        };

        // Only set up the timer if the user is authenticated
        if (isAuthenticated) {
            // Initial timer setup
            resetTimer();

            // Reset timer on user activity
            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            events.forEach(event => {
                document.addEventListener(event, resetTimer);
            });

            return () => {
                clearTimeout(inactivityTimer);
                events.forEach(event => {
                    document.removeEventListener(event, resetTimer);
                });
            };
        }
    }, [isAuthenticated, logout]);

    // User role monitoring for sensitive operations
    useEffect(() => {
        if (user && isAuthenticated) {
            // This could be expanded to handle role changes or session validation
            console.log('User authenticated with roles:', user.roles);
        }
    }, [user, isAuthenticated]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading: isLoadingUser,
                hasRole,
                logout: () => logout.mutate()
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
