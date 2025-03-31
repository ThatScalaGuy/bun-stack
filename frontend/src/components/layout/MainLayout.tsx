import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import styles from './MainLayout.module.css';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
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

                <main className={`${styles.content} ${!isMobile && sidebarOpen ? styles.contentWithSidebar : ''}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
