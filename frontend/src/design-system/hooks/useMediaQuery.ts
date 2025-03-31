import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false; // Default value for SSR
    });

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const mediaQuery = window.matchMedia(query);
        const updateMatch = (e: MediaQueryListEvent | MediaQueryList) => {
            setMatches(e.matches);
        };

        // Set initial value
        updateMatch(mediaQuery);

        // Use the deprecated addListener method for older browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', updateMatch);
            return () => mediaQuery.removeEventListener('change', updateMatch);
        } else {
            // For older browsers
            mediaQuery.addListener(updateMatch);
            return () => mediaQuery.removeListener(updateMatch);
        }
    }, [query]);

    return matches;
};
