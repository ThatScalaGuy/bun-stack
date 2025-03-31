import { ReactNode, useState } from 'react';

import styles from './MainLayout.module.css';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router';



export const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={styles.layout}>
            <Navbar toggleSidebar={toggleSidebar} />

            <div className={styles.container}>
                <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
