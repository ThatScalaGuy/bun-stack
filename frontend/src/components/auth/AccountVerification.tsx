import { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import styles from './AccountVerification.module.css';

export const AccountVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const { verifyAccount } = useAuth();

    useEffect(() => {
        verifyAccount.mutate(
            { token: token || "" }
        );
    }, []);

    if (verifyAccount.isPending) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Verifying your account...</p>
                </div>
            </div>
        );
    }

    if (verifyAccount.isSuccess) {
        return (
            <div className={styles.container}>
                <div className={styles.successMessage}>
                    <h2>Account Verified!</h2>
                    <p>Your email has been verified successfully.</p>
                    <p>You can now log in to your account.</p>
                    <button
                        className={styles.button}
                        onClick={() => navigate('/login')}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.errorMessage}>
                <h2>Verification Failed</h2>
                <p>{verifyAccount.error?.message || 'An unknown error occurred.'}</p>
                <div className={styles.actionLinks}>
                    <Link to="/login" className={styles.link}>
                        Login
                    </Link>
                    <span className={styles.divider}>|</span>
                    <Link to="/register" className={styles.link}>
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};
