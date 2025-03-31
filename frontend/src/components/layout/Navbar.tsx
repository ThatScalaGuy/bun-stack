import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

interface NavbarProps {
    toggleSidebar: () => void;
}

export const Navbar = ({ toggleSidebar }: NavbarProps) => {
    const { isAuthenticated, logout } = useAuthContext();
    const { user } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(
        () => localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    );
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={styles.navbar}>
            <div className={styles.navbarContent}>
                <div className={styles.navbarStart}>
                    {isAuthenticated && isMobile && (
                        <button
                            className={styles.menuButton}
                            onClick={toggleSidebar}
                            aria-label="Toggle menu"
                        >
                            <svg className={styles.menuIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}

                    <Link to="/" className={styles.logo}>
                        <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.logoText}>Enterprise Portal</span>
                    </Link>
                </div>

                <div className={styles.navbarEnd}>
                    <button
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? (
                            <svg className={styles.themeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg className={styles.themeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>

                    {isAuthenticated ? (
                        <div className={styles.userMenu} ref={dropdownRef}>
                            <button
                                className={styles.userButton}
                                onClick={toggleDropdown}
                                aria-expanded={dropdownOpen}
                            >
                                <span className={styles.userAvatar}>
                                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                </span>
                                <span className={styles.userName}>
                                    {user?.displayName || 'User'}
                                </span>
                                <svg className={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <strong>{user?.email}</strong>
                                    </div>

                                    <div className={styles.dropdownDivider}></div>

                                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                        <svg className={styles.dropdownItemIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Profile Settings
                                    </Link>

                                    <Link to="/security" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                        <svg className={styles.dropdownItemIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                                            <path d="M12 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Security
                                    </Link>

                                    {user?.roles?.some(role => role === 'admin') && (
                                        <Link to="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                            <svg className={styles.dropdownItemIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 4a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M3 20a7 7 0 0114 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M18 12.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M20.5 15.5L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Admin Dashboard
                                        </Link>
                                    )}

                                    <div className={styles.dropdownDivider}></div>

                                    <button className={styles.dropdownItem} onClick={() => {
                                        logout();
                                        setDropdownOpen(false);
                                    }}>
                                        <svg className={styles.dropdownItemIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.navLinks}>
                            <Link to="/login" className={styles.navLink}>Login</Link>
                            <Link to="/register" className={styles.navButton}>Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
