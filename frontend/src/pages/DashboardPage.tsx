import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Dashboard</h1>
                    <p className={styles.subtitle}>Welcome back, {user?.displayName || 'User'}</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.refreshButton}>
                        <svg className={styles.refreshIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                </div>
            </header>
            
            <div className={styles.content}>
                <div className={styles.grid}>
                    <div className={styles.overview}>
                        <h2 className={styles.sectionTitle}>Quick Access</h2>
                        <div className={styles.cardGrid}>
                            <div className={styles.card}>
                                <div className={styles.cardIconWrapper}>
                                    <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>Profile</h3>
                                    <p className={styles.cardDescription}>
                                        Manage your personal information and preferences
                                    </p>
                                </div>
                                <Link to="/profile" className={styles.cardLink}>
                                    <span>View Profile</span>
                                    <svg className={styles.linkArrow} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardIconWrapper}>
                                    <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>Security</h3>
                                    <p className={styles.cardDescription}>
                                        Manage passwords and two-factor authentication
                                    </p>
                                </div>
                                <Link to="/security" className={styles.cardLink}>
                                    <span>Security Settings</span>
                                    <svg className={styles.linkArrow} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>

                            {user?.roles?.some(role => role === 'admin') && (
                                <div className={`${styles.card} ${styles.adminCard}`}>
                                    <div className={styles.cardIconWrapper}>
                                        <svg className={styles.cardIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 4a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M3 20a7 7 0 0114 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M18 12.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M20.5 15.5L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>Administration</h3>
                                        <p className={styles.cardDescription}>
                                            Manage users, roles and organization settings
                                        </p>
                                    </div>
                                    <Link to="/admin" className={styles.cardLink}>
                                        <span>Admin Console</span>
                                        <svg className={styles.linkArrow} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.sidePanel}>
                        <div className={styles.statusCard}>
                            <h3 className={styles.statusTitle}>Account Status</h3>
                            <div className={styles.statusInfo}>
                                <div className={styles.statusRow}>
                                    <span className={styles.statusLabel}>Email:</span>
                                    <span className={styles.statusValue}>{user?.email}</span>
                                    {user?.isVerified ? (
                                        <span className={styles.verifiedBadge}>Verified</span>
                                    ) : (
                                        <Link to="/verify-email" className={styles.actionLink}>
                                            Verify Now
                                        </Link>
                                    )}
                                </div>

                                <div className={styles.statusRow}>
                                    <span className={styles.statusLabel}>2FA:</span>
                                    <span className={styles.statusValue}>
                                        {user?.mfaEnabled ? 'Enabled' : 'Not Enabled'}
                                    </span>
                                    {!user?.mfaEnabled && (
                                        <Link to="/security" className={styles.actionLink}>
                                            Enable
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.tipsCard}>
                            <h3 className={styles.tipsTitle}>Security Tips</h3>
                            <ul className={styles.tipsList}>
                                <li className={styles.tipsItem}>Use a strong, unique password</li>
                                <li className={styles.tipsItem}>Enable two-factor authentication</li>
                                <li className={styles.tipsItem}>Keep your contact information up to date</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
