import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

interface SidebarProps {
    isOpen: boolean;
    closeSidebar: () => void;
}

export const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
    const { user } = useAuth();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.roles?.some(role => role === 'admin');

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                closeSidebar();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, closeSidebar]);

    // Prevent scrolling when sidebar is open on mobile
    useEffect(() => {
        if (isOpen && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <div
            ref={sidebarRef}
            className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        >
            <div className={styles.sidebarHeader}>
                <h3>Navigation</h3>
                <button className={styles.closeButton} onClick={closeSidebar}>
                    &times;
                </button>
            </div>

            <nav className={styles.navigation}>
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                    onClick={closeSidebar}
                >
                    <span className={styles.navIcon}>📊</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                    onClick={closeSidebar}
                >
                    <span className={styles.navIcon}>👤</span>
                    <span>Profile</span>
                </NavLink>

                <NavLink
                    to="/security"
                    className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                    onClick={closeSidebar}
                >
                    <span className={styles.navIcon}>🔒</span>
                    <span>Security</span>
                </NavLink>

                {isAdmin && (
                    <>
                        <div className={styles.divider}></div>
                        <h4 className={styles.sectionTitle}>Administration</h4>

                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                            onClick={closeSidebar}
                        >
                            <span className={styles.navIcon}>👥</span>
                            <span>User Management</span>
                        </NavLink>

                        <NavLink
                            to="/admin/roles"
                            className={({ isActive }) => isActive ? styles.activeNavItem : styles.navItem}
                            onClick={closeSidebar}
                        >
                            <span className={styles.navIcon}>🛡️</span>
                            <span>Role Management</span>
                        </NavLink>
                    </>
                )}
            </nav>
        </div>
    );
};
