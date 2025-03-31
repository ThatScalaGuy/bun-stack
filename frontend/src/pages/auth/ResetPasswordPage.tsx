import { PasswordResetConfirm } from '../../components/auth/PasswordResetConfirm';
import styles from './AuthPage.module.css';

export const ResetPasswordPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <PasswordResetConfirm />
            </div>
            <div className={styles.imageContainer}>
                <div className={styles.overlay}>
                    <h1>Reset Your Password</h1>
                    <p>Create a new password for your account.</p>
                </div>
            </div>
        </div>
    );
};
