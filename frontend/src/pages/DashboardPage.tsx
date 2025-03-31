import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Welcome, {user?.displayName}!</h1>
                <p>Manage your account and access your personalized dashboard.</p>
            </header>

            <div className={styles.cardsContainer}>
                <div className={styles.card}>
                    <div className={styles.cardIcon}>👤</div>
                    <h2>Profile</h2>
                    <p>View and update your personal information</p>
                    <Link to="/profile" className={styles.cardLink}>
                        Manage Profile
                    </Link>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardIcon}>🔒</div>
                    <h2>Security</h2>
                    <p>Change your password and set up two-factor authentication</p>
                    <Link to="/security" className={styles.cardLink}>
                        Security Settings
                    </Link>
                </div>

                {user?.roles?.some(role => role === 'admin') && (
                    <div className={`${styles.card} ${styles.adminCard}`}>
                        <div className={styles.cardIcon}>⚙️</div>
                        <h2>Admin Panel</h2>
                        <p>Access administrative functions and manage users</p>
                        <Link to="/admin" className={styles.cardLink}>
                            Go to Admin Panel
                        </Link>
                    </div>
                )}
            </div>

            <div className={styles.accountStatus}>
                <h3>Account Status</h3>
                <div className={styles.statusItems}>
                    <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>Email:</span>
                        <span>{user?.email}</span>
                        {user?.isEmailVerified ? (
                            <span className={styles.verifiedBadge}>Verified</span>
                        ) : (
                            <Link to="/verify-email" className={styles.verifyLink}>
                                Verify Now
                            </Link>
                        )}
                    </div>



                    <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>Account Created:</span>
                        <span>{new Date(user?.createdAt || '').toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
