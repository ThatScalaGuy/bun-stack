import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useBackend } from '../../context/BackendContext';
import styles from './AdminDashboardPage.module.css';

interface DashboardStats {
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    mfaEnabledUsers: number;
    totalRoles: number;
    recentRegistrations: number;
}

export const AdminDashboardPage = () => {
    const backend = useBackend();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await backend.api.admin.stats.get();
                setStats(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
                setError('Failed to load dashboard data. Please try again.');
                setLoading(false);
            }
        };

        fetchStats();
    }, [backend]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button
                    className={styles.retryButton}
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Admin Dashboard</h1>
                <p>Overview of your user management system</p>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Total Users</h3>
                    <div className={styles.statValue}>{stats?.totalUsers}</div>
                    <Link to="/admin/users" className={styles.statLink}>View All Users</Link>
                </div>

                <div className={styles.statCard}>
                    <h3>Verified Users</h3>
                    <div className={styles.statValue}>{stats?.verifiedUsers}</div>
                    <div className={styles.statMeta}>
                        {stats && stats.totalUsers > 0 && (
                            <div className={styles.statPercentage}>
                                {Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <h3>Unverified Users</h3>
                    <div className={styles.statValue}>{stats?.unverifiedUsers}</div>
                    <div className={styles.statMeta}>
                        {stats && stats.totalUsers > 0 && (
                            <div className={styles.statPercentage}>
                                {Math.round((stats.unverifiedUsers / stats.totalUsers) * 100)}%
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <h3>MFA Enabled</h3>
                    <div className={styles.statValue}>{stats?.mfaEnabledUsers}</div>
                    <div className={styles.statMeta}>
                        {stats && stats.totalUsers > 0 && (
                            <div className={styles.statPercentage}>
                                {Math.round((stats.mfaEnabledUsers / stats.totalUsers) * 100)}%
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <h3>Total Roles</h3>
                    <div className={styles.statValue}>{stats?.totalRoles}</div>
                    <Link to="/admin/roles" className={styles.statLink}>Manage Roles</Link>
                </div>

                <div className={styles.statCard}>
                    <h3>Recent Registrations</h3>
                    <div className={styles.statValue}>{stats?.recentRegistrations}</div>
                    <div className={styles.statMeta}>Last 30 days</div>
                </div>
            </div>

            <div className={styles.adminActions}>
                <h2>Quick Actions</h2>
                <div className={styles.actionButtons}>
                    <Link to="/admin/users/create" className={styles.actionButton}>
                        <span className={styles.actionIcon}>➕</span>
                        Create User
                    </Link>

                    <Link to="/admin/roles/create" className={styles.actionButton}>
                        <span className={styles.actionIcon}>🛡️</span>
                        Create Role
                    </Link>

                    <Link to="/admin/users/export" className={styles.actionButton}>
                        <span className={styles.actionIcon}>📊</span>
                        Export User Data
                    </Link>

                    <Link to="/admin/audit-logs" className={styles.actionButton}>
                        <span className={styles.actionIcon}>📝</span>
                        View Audit Logs
                    </Link>
                </div>
            </div>
        </div>
    );
};
