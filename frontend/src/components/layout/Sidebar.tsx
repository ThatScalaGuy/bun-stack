import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

interface SidebarProps {
    isOpen: boolean;
    closeSidebar: () => void;
    isCollapsible?: boolean;
}

export const Sidebar = ({ isOpen, closeSidebar, isCollapsible = true }: SidebarProps) => {
    const { user } = useAuth();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [collapsed, setCollapsed] = useState(false);

    const isAdmin = user?.roles?.some(role => role === 'admin');

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen &&
                window.innerWidth < 1024 &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)) {
                closeSidebar();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, closeSidebar]);

    // Prevent scrolling when sidebar is open on mobile
    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleCollapse = () => {
        if (isCollapsible) {
            setCollapsed(!collapsed);
        }
    };

    return (
        <div
            ref={sidebarRef}
            className={`${styles.sidebar} 
                       ${isOpen ? styles.open : ''} 
                       ${collapsed ? styles.collapsed : ''}`}
        >
            <div className={styles.sidebarHeader}>
                <h3 className={styles.sidebarTitle}>Navigation</h3>
                <div className={styles.sidebarActions}>
                    {isCollapsible && (
                        <button
                            className={styles.collapseButton}
                            onClick={handleCollapse}
                            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <svg className={styles.collapseIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d={collapsed ? "M8 4l8 8-8 8" : "M16 4l-8 8 8 8"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                    <button
                        className={styles.closeButton}
                        onClick={closeSidebar}
                        aria-label="Close sidebar"
                    >
                        <svg className={styles.closeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <nav className={styles.navigation}>
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                    onClick={closeSidebar}
                >
                    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={styles.navLabel}>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                    onClick={closeSidebar}
                >
                    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={styles.navLabel}>Profile</span>
                </NavLink>

                <NavLink
                    to="/security"
                    className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                    onClick={closeSidebar}
                >
                    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={styles.navLabel}>Security</span>
                </NavLink>

                {isAdmin && (
                    <>
                        <div className={styles.divider}>
                            <span className={styles.dividerLabel}>Admin</span>
                        </div>

                        <NavLink
                            to="/admin"
                            className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                            onClick={closeSidebar}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3h7a2 2 0 012 2v14a2 2 0 01-2 2h-7m0-18L5 3a2 2 0 00-2 2v14a2 2 0 002 2h7m0-18v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className={styles.navLabel}>Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                            onClick={closeSidebar}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className={styles.navLabel}>Users</span>
                        </NavLink>

                        <NavLink
                            to="/admin/roles"
                            className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                            onClick={closeSidebar}
                        >
                            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 7h-8M20 11h-8M20 15h-8M4 7h.01M4 11h.01M4 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className={styles.navLabel}>Roles</span>
                        </NavLink>
                    </>
                )}

                <div className={styles.sidebarFooter}>
                    <div className={styles.footerItem}>
                        <svg className={styles.footerIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.footerText}>v1.0.0</span>
                    </div>
                </div>
            </nav>
        </div>
    );
};
