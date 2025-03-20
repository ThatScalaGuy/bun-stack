import { createContext, useContext, ReactNode } from 'react';
import { treaty } from '@elysiajs/eden';
import type { Backend } from '@backend';

// Create the client instance
const createBackendClient = () => {
    // @ts-expect-error Ich bin zu doof
    return treaty<Backend>(window.location.origin);
};

// Create the context with the client
const BackendContext = createContext<ReturnType<typeof createBackendClient> | null>(null);

// Provider component
export const BackendProvider = ({ children }: { children: ReactNode }) => {
    const client = createBackendClient();

    return (
        <BackendContext.Provider value={client}>
            {children}
        </BackendContext.Provider>
    );
};

// Custom hook to use the backend client
export const useBackend = () => {
    const context = useContext(BackendContext);

    if (!context) {
        throw new Error('useBackend must be used within a BackendProvider');
    }

    return context;
};
