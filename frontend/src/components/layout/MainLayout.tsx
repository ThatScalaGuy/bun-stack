import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import styles from './MainLayout.module.css';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';

export const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // Auto-close sidebar on mobile, keep open on desktop
            if (mobile) setSidebarOpen(false);
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={styles.layout}>
            <Navbar toggleSidebar={toggleSidebar} />
            
            <div className={styles.container}>
                <Sidebar
                    isOpen={sidebarOpen}
                    closeSidebar={() => setSidebarOpen(false)}
                    isCollapsible={!isMobile}
                />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
            
            <StatusBar />
        </div>
    );
};
