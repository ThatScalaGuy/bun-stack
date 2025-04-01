import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import styles from './LandingPage.module.css';

export const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logo}>User Management System</div>
                <nav className={styles.nav}>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className={styles.navButton}>
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className={styles.navLink}>
                                Login
                            </Link>
                            <Link to="/register" className={styles.navButton}>
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            <main className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Secure User Management</h1>
                    <p>A complete authentication system with role-based access control</p>

                    {isAuthenticated ? (
                        <Link to="/dashboard" className={styles.heroButton}>
                            Go to Dashboard
                        </Link>
                    ) : (
                        <div className={styles.heroButtons}>
                            <Link to="/register" className={styles.heroButton}>
                                Get Started
                            </Link>
                            <Link to="/login" className={styles.heroButtonSecondary}>
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <section className={styles.features}>
                <h2>Key Features</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔐</div>
                        <h3>Secure Authentication</h3>
                        <p>Modern security practices including password hashing and secure session management</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔄</div>
                        <h3>Account Recovery</h3>
                        <p>Simple password reset flow with email verification</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🛡️</div>
                        <h3>Two-Factor Auth</h3>
                        <p>Enhanced security with time-based one-time password (TOTP) authentication</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>👤</div>
                        <h3>User Profiles</h3>
                        <p>Customizable user profiles with personal information management</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔑</div>
                        <h3>Role-Based Access</h3>
                        <p>Fine-grained access control with custom roles and permissions</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>⚡</div>
                        <h3>Fast & Responsive</h3>
                        <p>Optimized performance with a clean, modern UI that works on all devices</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
