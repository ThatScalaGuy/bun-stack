import { useState } from 'react';
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
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        setTheme(newTheme);
    };

    return (
        <header className={styles.navbar}>
            <div className={styles.navbarContent}>
                <div className={styles.navbarStart}>
                    {isAuthenticated && (
                        <button className={styles.menuButton} onClick={toggleSidebar}>
                            <span className={styles.menuIcon}>☰</span>
                        </button>
                    )}

                    <Link to="/" className={styles.logo}>
                        User Management
                    </Link>
                </div>

                <div className={styles.navbarEnd}>
                    <button className={styles.themeToggle} onClick={toggleTheme}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {isAuthenticated ? (
                        <div className={styles.userMenu}>
                            <button className={styles.userButton} onClick={toggleDropdown}>
                                <span className={styles.userAvatar}>
                                    {user?.displayName?.[0]}
                                </span>
                                <span className={styles.userName}>
                                    {user?.displayName}
                                </span>
                                <span className={styles.dropdownIcon}>▼</span>
                            </button>

                            {dropdownOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <strong>{user?.email}</strong>
                                    </div>

                                    <div className={styles.dropdownDivider}></div>

                                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                        Profile Settings
                                    </Link>

                                    <Link to="/security" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                        Security
                                    </Link>

                                    {user?.roles?.some(role => role === 'admin') && (
                                        <Link to="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                            Admin Dashboard
                                        </Link>
                                    )}

                                    <div className={styles.dropdownDivider}></div>

                                    <button className={styles.dropdownItem} onClick={logout}>
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
